using API.DTOs;
using API.Validators.AirConditioners;
using API.Validators.Auth;
using API.Validators.Companies;
using API.Validators.ErrorCodes;
using API.Validators.Inventory;
using API.Validators.Montages;
using FluentValidation;

namespace API.Infrastructure;

public static class ValidatorExtensions
{
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

        services.AddValidatorsFromAssemblyContaining<CreateCompanyDtoValidator>();

        return services;
    }
}
