using System.Reflection;
using System.Text;
using System.Threading.RateLimiting;
using API.Data;
using API.Data.Entities;
using API.Data.Interceptors;
using API.DTOs;
using API.DTOs.Auth;
using API.Models;
using API.Repositories;
using API.Repositories.Companies;
using API.Services;
using API.Services.Admin;
using API.Services.AirConditioners;
using API.Services.Auth;
using API.Services.Background;
using API.Services.Companies;
using API.Services.Email;
using API.Services.Inventory;
using API.Services.MontageInventory;
using API.Services.MontagePhotos;
using API.Services.Montages;
using API.Services.ReportedProblems;
using API.Services.Stripe;
using API.Validators.AirConditioners;
using API.Validators.Auth;
using API.Validators.Companies;
using API.Validators.ErrorCodes;
using API.Validators.Inventory;
using API.Validators.Montages;
using FluentValidation;
using Mapster;
using MapsterMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Minio;

namespace API.Infrastructure;

/// <summary>
/// All service-registration extension methods for the API, consolidated into a single file.
/// <see cref="Program"/> calls each method individually, in order:
/// AddApiServices → AddDatabaseServices → AddIdentityServices → AddRepositories →
/// AddApplicationServices → AddMapster → AddExternalServices → AddValidators.
/// </summary>
public static class DependencyInjectionExtensions
{
    #region API (controllers, OpenAPI, CORS, rate limiting)

    public static IServiceCollection AddApiServices(
        this IServiceCollection services,
        IConfiguration config,
        IHostEnvironment env)
    {
        services.AddControllers();
        services.AddOpenApi();

        var allowedOrigins = config.GetSection("CorsSettings:AllowedOrigins").Get<string[]>();

        services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", policy =>
            {
                if (allowedOrigins != null && allowedOrigins.Length > 0)
                {
                    policy.WithOrigins(allowedOrigins)
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                }
                else if (env.IsDevelopment())
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                }
                else
                {
                    policy.WithOrigins(Array.Empty<string>());
                }
            });
        });

        services.AddRateLimiter(options =>
        {
            options.AddFixedWindowLimiter("auth", opt =>
            {
                opt.Window               = TimeSpan.FromMinutes(1);
                opt.PermitLimit          = 10;
                opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                opt.QueueLimit           = 0;
            });

            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            options.OnRejected = async (ctx, token) =>
            {
                ctx.HttpContext.Response.Headers.RetryAfter =
                    ((int)TimeSpan.FromMinutes(1).TotalSeconds).ToString();
                ctx.HttpContext.Response.ContentType = "application/json";
                await ctx.HttpContext.Response.WriteAsync(
                    "{\"message\":\"Too many requests. Please wait a moment and try again.\"}",
                    token);
            };
        });

        return services;
    }

    #endregion

    #region Database (EF Core / PostgreSQL + soft-delete interceptor)

    public static IServiceCollection AddDatabaseServices(this IServiceCollection services, IConfiguration config)
    {
        services.AddScoped<SoftDeleteInterceptor>();

        services.AddDbContext<ApplicationDbContext>((serviceProvider, opt) =>
            opt.UseNpgsql(config.GetConnectionString("DefaultConnection"))
               .AddInterceptors(serviceProvider.GetRequiredService<SoftDeleteInterceptor>()));

        return services;
    }

    #endregion

    #region Identity + JWT authentication

    public static IServiceCollection AddIdentityServices(
        this IServiceCollection services,
        IConfiguration config,
        IHostEnvironment env)
    {
        services.AddIdentity<ApplicationUser, IdentityRole>(options =>
            {
                options.Password.RequireDigit            = true;
                options.Password.RequireLowercase        = true;
                options.Password.RequireUppercase        = true;
                options.Password.RequireNonAlphanumeric  = false;
                options.Password.RequiredLength          = 8;
                options.User.RequireUniqueEmail          = true;

                options.Lockout.MaxFailedAccessAttempts = 10;
                options.Lockout.DefaultLockoutTimeSpan  = TimeSpan.FromMinutes(15);
                options.Lockout.AllowedForNewUsers      = true;
            })
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

        var jwtSettings = config.GetSection("JwtSettings");
        var secretKey   = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme             = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.SaveToken = true;

            options.RequireHttpsMetadata = !env.IsDevelopment();

            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer           = true,
                ValidateAudience         = true,
                ValidateLifetime         = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer              = jwtSettings["Issuer"],
                ValidAudience            = jwtSettings["Audience"],
                IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
                ClockSkew                = TimeSpan.Zero
            };
        });

        return services;
    }

    #endregion

    #region Repositories

    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IAirConditionerRepository, AirConditionerRepository>();
        services.AddScoped<IMontageRepository, MontageRepository>();
        services.AddScoped<ICompanyRepository, CompanyRepository>();
        services.AddScoped<IInventoryRepository, InventoryRepository>();

        return services;
    }

    #endregion

    #region Application services (+ background services)

    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<IAirConditionerService, AirConditionerService>();
        services.AddScoped<IMontageService, MontageService>();
        services.AddScoped<ICompanyService, CompanyService>();
        services.AddScoped<IInventoryService, InventoryService>();
        services.AddScoped<IInventoryAuditService, InventoryAuditService>();
        services.AddScoped<IMontageInventoryService, MontageInventoryService>();
        services.AddScoped<IMontagePhotoService, MontagePhotoService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IReportedProblemService, ReportedProblemService>();

        services.AddHostedService<TrialCleanupService>();

        return services;
    }

    #endregion

    #region Mapster

    public static IServiceCollection AddMapster(this IServiceCollection services)
    {
        var config = TypeAdapterConfig.GlobalSettings;
        config.Scan(Assembly.GetExecutingAssembly());

        services.AddSingleton(config);
        services.AddScoped<IMapper, ServiceMapper>();

        return services;
    }

    #endregion

    #region External services (MinIO, Stripe, Email/Mailtrap + background services)

    public static IServiceCollection AddExternalServices(this IServiceCollection services, IConfiguration config)
    {
        var minioSettings = config.GetSection("MinioSettings").Get<MinioSettings>();
        if (minioSettings != null)
        {
            services.Configure<MinioSettings>(config.GetSection("MinioSettings"));
            services.AddSingleton<IMinioClient>(_ =>
                new MinioClient()
                    .WithEndpoint(minioSettings.Endpoint)
                    .WithCredentials(minioSettings.AccessKey, minioSettings.SecretKey)
                    .WithSSL(minioSettings.UseSSL)
                    .Build());
        }

        services.Configure<StripeSettings>(config.GetSection("StripeSettings"));
        services.AddScoped<IStripeService, StripeService>();

        services.Configure<EmailSettings>(config.GetSection("EmailSettings"));
        services.AddHttpClient("Mailtrap");
        services.AddScoped<IEmailService, EmailService>();
        services.AddSingleton<IBackgroundEmailQueue, BackgroundEmailQueue>();
        services.AddHostedService<BackgroundEmailProcessor>();
        services.AddHostedService<RefreshTokenCleanupService>();

        return services;
    }

    #endregion

    #region FluentValidation validators

    public static IServiceCollection AddValidators(this IServiceCollection services)
    {
        services.AddScoped<IValidator<CreateCompanyDto>, CreateCompanyDtoValidator>();
        services.AddScoped<IValidator<UpdateCompanyDto>, UpdateCompanyDtoValidator>();
        services.AddScoped<IValidator<CreateCompanyUserDto>, CreateCompanyUserDtoValidator>();
        services.AddScoped<IValidator<UpdateSubscriptionDto>, UpdateSubscriptionDtoValidator>();
        services.AddScoped<IValidator<CreateAirConditionerDto>, CreateAirConditionerDtoValidator>();
        services.AddScoped<IValidator<UpdateAirConditionerDto>, UpdateAirConditionerDtoValidator>();
        services.AddScoped<IValidator<CreateErrorCodeDto>, CreateErrorCodeDtoValidator>();
        services.AddScoped<IValidator<UpdateErrorCodeDto>, UpdateErrorCodeDtoValidator>();
        services.AddScoped<IValidator<CreateMontageDto>, CreateMontageDtoValidator>();
        services.AddScoped<IValidator<UpdateMontageDto>, UpdateMontageDtoValidator>();
        services.AddScoped<IValidator<CreateInventoryItemDto>, CreateInventoryItemDtoValidator>();
        services.AddScoped<IValidator<UpdateInventoryItemDto>, UpdateInventoryItemDtoValidator>();
        services.AddScoped<IValidator<AdjustInventoryQuantityDto>, AdjustInventoryQuantityDtoValidator>();
        services.AddScoped<IValidator<RegisterDto>, RegisterDtoValidator>();
        services.AddScoped<IValidator<LoginDto>, LoginDtoValidator>();
        services.AddScoped<IValidator<CreateEmployeeDto>, CreateEmployeeDtoValidator>();
        services.AddScoped<IValidator<ChangePasswordDto>, ChangePasswordDtoValidator>();
        services.AddScoped<IValidator<ResetPasswordDto>, ResetPasswordDtoValidator>();
        services.AddScoped<IValidator<UpdateProfileDto>, UpdateProfileDtoValidator>();

        services.AddValidatorsFromAssemblyContaining<CreateCompanyDtoValidator>();

        return services;
    }

    #endregion
}
