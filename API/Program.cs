using API.Data;
using API.Data.Entities;
using API.Data.Seeds;
using API.DTOs;
using API.Repositories;
using API.Repositories.Companies;
using API.Services;
using API.Services.AirConditioners;
using API.Services.Companies;
using API.Services.Montages;
using API.Validators.AirConditioners;
using API.Validators.Companies;
using API.Validators.ErrorCodes;
using API.Validators.Montages;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<ApplicationDbContext>(opt => 
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        // Configure password requirements if needed
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequiredLength = 6;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();


// Register repositories
builder.Services.AddScoped<IAirConditionerRepository, AirConditionerRepository>();
builder.Services.AddScoped<IMontageRepository, MontageRepository>();
builder.Services.AddScoped<ICompanyRepository, CompanyRepository>();

// Register services
builder.Services.AddScoped<IAirConditionerService, AirConditionerService>();
builder.Services.AddScoped<IMontageService, MontageService>();
builder.Services.AddScoped<ICompanyService, CompanyService>();

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


// Register validators
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// Add CORS (optional)
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

// Use CORS (optional)
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();