using System.Text;
using API.Data;
using API.Data.Entities;
using API.Data.Seeds;
using API.DTOs;
using API.Repositories;
using API.Repositories.Companies;
using API.Services;
using API.Services.AirConditioners;
using API.Services.Auth;
using API.Services.Companies;
using API.Services.Inventory;
using API.Services.Montages;
using API.Validators.AirConditioners;
using API.Validators.Auth;
using API.Validators.Companies;
using API.Validators.ErrorCodes;
using API.Validators.Inventory;
using API.Validators.Montages;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<ApplicationDbContext>(opt => 
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        // Configure password requirements
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequiredLength = 6;
        
        // User settings
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false; // Set to true in production
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero // Remove delay of token when expiring
    };
});

// Register repositories
builder.Services.AddScoped<IAirConditionerRepository, AirConditionerRepository>();
builder.Services.AddScoped<IMontageRepository, MontageRepository>();
builder.Services.AddScoped<ICompanyRepository, CompanyRepository>();
builder.Services.AddScoped<IInventoryRepository, InventoryRepository>();

// Register services
builder.Services.AddScoped<IAirConditionerService, AirConditionerService>();
builder.Services.AddScoped<IMontageService, MontageService>();
builder.Services.AddScoped<ICompanyService, CompanyService>();
builder.Services.AddScoped<IInventoryService, InventoryService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Register validators
builder.Services.AddScoped<IValidator<CreateCompanyDto>, CreateCompanyDtoValidator>();
builder.Services.AddScoped<IValidator<UpdateCompanyDto>, UpdateCompanyDtoValidator>();
builder.Services.AddScoped<IValidator<CreateCompanyUserDto>, CreateCompanyUserDtoValidator>();
builder.Services.AddScoped<IValidator<UpdateSubscriptionDto>, UpdateSubscriptionDtoValidator>();
builder.Services.AddScoped<IValidator<CreateAirConditionerDto>, CreateAirConditionerDtoValidator>();
builder.Services.AddScoped<IValidator<UpdateAirConditionerDto>, UpdateAirConditionerDtoValidator>();
builder.Services.AddScoped<IValidator<CreateErrorCodeDto>, CreateErrorCodeDtoValidator>();
builder.Services.AddScoped<IValidator<UpdateErrorCodeDto>, UpdateErrorCodeDtoValidator>();
builder.Services.AddScoped<IValidator<CreateMontageDto>, CreateMontageDtoValidator>();
builder.Services.AddScoped<IValidator<UpdateMontageDto>, UpdateMontageDtoValidator>();
builder.Services.AddScoped<IValidator<CreateInventoryItemDto>, CreateInventoryItemDtoValidator>();
builder.Services.AddScoped<IValidator<UpdateInventoryItemDto>, UpdateInventoryItemDtoValidator>();
builder.Services.AddScoped<IValidator<AdjustInventoryQuantityDto>, AdjustInventoryQuantityDtoValidator>();
builder.Services.AddScoped<IValidator<RegisterDto>, RegisterDtoValidator>();
builder.Services.AddScoped<IValidator<LoginDto>, LoginDtoValidator>();
builder.Services.AddScoped<IValidator<CreateEmployeeDto>, CreateEmployeeDtoValidator>();

// Register validators from assembly
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        context.Database.Migrate();
        
        SeedDataManager.SeedAllData(services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database.");
    }
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    
    app.MapScalarApiReference(options =>
    {
        options
            .WithTitle("AirProV2 API")
            .WithTheme(ScalarTheme.Purple)
            .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
    });
}

app.UseHttpsRedirection();

// Use CORS
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();