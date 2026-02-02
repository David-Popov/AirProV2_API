using API.Common;
using API.Data;
using API.Data.Entities;
using API.DTOs;
using API.Models;
using API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace API.Services.AirConditioners;

public class AirConditionerService : IAirConditionerService
{
    private readonly IAirConditionerRepository _repository;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AirConditionerService> _logger;

    public AirConditionerService(
        IAirConditionerRepository repository, 
        ApplicationDbContext context,
        ILogger<AirConditionerService> logger)
    {
        _repository = repository;
        _context = context;
        _logger = logger;
    }

    public async Task AddAirConditionerAsync(CreateAirConditionerDto dto)
    {
        try
        {
            var existing = await _context.AirConditioners
                .AsNoTracking()
                .FirstOrDefaultAsync(ac => ac.Brand == dto.Brand && ac.Model == dto.Model);

            if (existing != null)
            {
                throw new InvalidOperationException($"An air conditioner with brand '{dto.Brand}' and model '{dto.Model}' already exists.");
            }

            var airConditioner = new AirConditioner
            {
                Name = dto.Name,
                Brand = dto.Brand,
                Model = dto.Model,
                Kilowatts = dto.Kilowatts,
                Description = dto.Description,
                Price = dto.Price,
                ImageUrl = dto.ImageUrl,
                PipeSizeLiquid = dto.PipeSizeLiquid,
                PipeSizeGas = dto.PipeSizeGas,
                RefrigerantType = dto.RefrigerantType,
                FactoryRefrigerantCharge = dto.FactoryRefrigerantCharge,
                PowerSupplyLocation = dto.PowerSupplyLocation,
                CableSection = dto.CableSection,
                RecommendedFuse = dto.RecommendedFuse,
                IndoorDimensions = dto.IndoorDimensions,
                OutdoorDimensions = dto.OutdoorDimensions,
                WeightIndoor = dto.WeightIndoor,
                WeightOutdoor = dto.WeightOutdoor,
                MaxPipeLength = dto.MaxPipeLength,
                MaxHeightDifference = dto.MaxHeightDifference
            };
            
            await _repository.AddAirConditionerAsync(airConditioner);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task UpdateAirConditionerAsync(Guid airConditionerId, UpdateAirConditionerDto dto)
    {
        try
        {
            var airConditioner = await _repository.GetByIdAsync(airConditionerId);
            if (airConditioner == null)
            {
                throw new InvalidOperationException("Air conditioner not found");
            }

            airConditioner.Name = dto.Name;
            airConditioner.Brand = dto.Brand;
            airConditioner.Model = dto.Model;
            airConditioner.Kilowatts = dto.Kilowatts;
            airConditioner.Description = dto.Description;
            airConditioner.Price = dto.Price;
            airConditioner.ImageUrl = dto.ImageUrl;
            airConditioner.PipeSizeLiquid = dto.PipeSizeLiquid;
            airConditioner.PipeSizeGas = dto.PipeSizeGas;
            airConditioner.RefrigerantType = dto.RefrigerantType;
            airConditioner.FactoryRefrigerantCharge = dto.FactoryRefrigerantCharge;
            airConditioner.PowerSupplyLocation = dto.PowerSupplyLocation;
            airConditioner.CableSection = dto.CableSection;
            airConditioner.RecommendedFuse = dto.RecommendedFuse;
            airConditioner.IndoorDimensions = dto.IndoorDimensions;
            airConditioner.OutdoorDimensions = dto.OutdoorDimensions;
            airConditioner.WeightIndoor = dto.WeightIndoor;
            airConditioner.WeightOutdoor = dto.WeightOutdoor;
            airConditioner.MaxPipeLength = dto.MaxPipeLength;
            airConditioner.MaxHeightDifference = dto.MaxHeightDifference;

            await _repository.UpdateAirConditionerAsync(airConditioner);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task DeleteAirConditionerAsync(Guid airConditionerId)
    {
        try
        {
            var airConditioner = await _repository.GetByIdAsync(airConditionerId);
            if (airConditioner != null)
            {
                await _repository.DeleteAirConditionerAsync(airConditioner);
            }
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<AirConditionerDto?> GetByIdAsync(Guid airConditionerId)
    {
        try
        {
            var entity = await _repository.GetByIdAsync(airConditionerId);
            
            if (entity is null)
            {
                throw new InvalidOperationException("Air conditioner not found");
            }
            
            return ToDto(entity);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<PagedList<AirConditionerDto>> GetAirConditionersAsync(PageParameters pageParameters)
    {
        try
        {
            var query = _context.AirConditioners
                .AsNoTracking()
                .Select(ac => new AirConditionerDto
                {
                    Id = ac.Id,
                    Name = ac.Name,
                    Brand = ac.Brand,
                    Model = ac.Model,
                    Kilowatts = ac.Kilowatts,
                    Description = ac.Description,
                    Price = ac.Price,
                    ImageUrl = ac.ImageUrl,
                    PipeSizeLiquid = ac.PipeSizeLiquid,
                    PipeSizeGas = ac.PipeSizeGas,
                    RefrigerantType = ac.RefrigerantType,
                    FactoryRefrigerantCharge = ac.FactoryRefrigerantCharge,
                    PowerSupplyLocation = ac.PowerSupplyLocation,
                    CableSection = ac.CableSection,
                    RecommendedFuse = ac.RecommendedFuse,
                    IndoorDimensions = ac.IndoorDimensions,
                    OutdoorDimensions = ac.OutdoorDimensions,
                    WeightIndoor = ac.WeightIndoor,
                    WeightOutdoor = ac.WeightOutdoor,
                    MaxPipeLength = ac.MaxPipeLength,
                    MaxHeightDifference = ac.MaxHeightDifference,
                });
            return await PagedList<AirConditionerDto>.CreateAsync(query, pageParameters);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task AddErrorCodeAsync(CreateErrorCodeDto dto)
    {
        try
        {
            var existing = await _context.ErrorCodes
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.AirConditionerId == dto.AirConditionerId && e.Code == dto.Code);

            if (existing != null)
            {
                throw new InvalidOperationException($"An error code '{dto.Code}' already exists for this air conditioner.");
            }

            var errorCode = new ErrorCode
            {
                AirConditionerId = dto.AirConditionerId,
                Code = dto.Code,
                ErrorName = dto.ErrorName,
                Description = dto.Description,
                Solution = dto.Solution,
                ErrorCodeSeverity = string.IsNullOrEmpty(dto.Severity) ? ErrorCodeSeverity.Low : Enum.Parse<ErrorCodeSeverity>(dto.Severity)
            };
            
            await _repository.AddErrorCodeAsync(errorCode);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task UpdateErrorCodeAsync(Guid errorCodeId, UpdateErrorCodeDto dto)
    {
        try
        {
            var errorCode = await _repository.GetErrorCodeByIdAsync(errorCodeId);
            if (errorCode == null)
            {
                throw new InvalidOperationException("Error code not found");
            }

            errorCode.AirConditionerId = dto.AirConditionerId;
            errorCode.Code = dto.Code;
            errorCode.ErrorName = dto.ErrorName;
            errorCode.Description = dto.Description;
            errorCode.Solution = dto.Solution;
            
            if (!string.IsNullOrEmpty(dto.Severity) && Enum.TryParse<ErrorCodeSeverity>(dto.Severity, out var severity))
            {
                errorCode.ErrorCodeSeverity = severity;
            }

            await _repository.UpdateErrorCodeAsync(errorCode);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task DeleteErrorCodeAsync(Guid errorCodeId)
    {
        try
        {
            var errorCode = await _repository.GetErrorCodeByIdAsync(errorCodeId);
            if (errorCode != null)
            {
                await _repository.DeleteErrorCodeAsync(errorCode);
            }
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<ErrorCodeDto?> GetErrorCodeByIdAsync(Guid errorCodeId)
    {
        try
        {
            var entity = await _repository.GetErrorCodeByIdAsync(errorCodeId);

            if (entity is null)
            {
                throw new InvalidOperationException("Error code not found");
            }
            
            return ToDto(entity);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<PagedList<ErrorCodeDto>> GetErrorCodesByAirConditionerIdAsync(Guid airConditionerId, PageParameters pageParameters)
    {
        try
        {
            var query = _context.ErrorCodes
                .AsNoTracking()
                .Where(e => e.AirConditionerId == airConditionerId)
                .Select(ec => new ErrorCodeDto
                {
                    Id = ec.Id,
                    AirConditionerId = ec.AirConditionerId,
                    Code = ec.Code,
                    ErrorName = ec.ErrorName,
                    Description = ec.Description,
                    Solution = ec.Solution,
                    Severity = ec.ErrorCodeSeverity.ToString(),
                });
            return await PagedList<ErrorCodeDto>.CreateAsync(query, pageParameters);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<PagedList<ErrorCodeDto>> GetAllErrorCodesAsync(PageParameters pageParameters)
    {
        try
        {
            var query = _context.ErrorCodes
                .AsNoTracking()
                .Select(ec => new ErrorCodeDto
                {
                    Id = ec.Id,
                    AirConditionerId = ec.AirConditionerId,
                    Code = ec.Code,
                    ErrorName = ec.ErrorName,
                    Description = ec.Description,
                    Solution = ec.Solution,
                    Severity = ec.ErrorCodeSeverity.ToString(),
                });
            return await PagedList<ErrorCodeDto>.CreateAsync(query, pageParameters);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    private static AirConditionerDto ToDto(AirConditioner airConditioner)
    {
        return new AirConditionerDto
        {
            Id = airConditioner.Id,
            Name = airConditioner.Name,
            Brand = airConditioner.Brand,
            Model = airConditioner.Model,
            Kilowatts = airConditioner.Kilowatts,
            Description = airConditioner.Description,
            Price = airConditioner.Price,
            ImageUrl = airConditioner.ImageUrl,
            PipeSizeLiquid = airConditioner.PipeSizeLiquid,
            PipeSizeGas = airConditioner.PipeSizeGas,
            RefrigerantType = airConditioner.RefrigerantType,
            FactoryRefrigerantCharge = airConditioner.FactoryRefrigerantCharge,
            PowerSupplyLocation = airConditioner.PowerSupplyLocation,
            CableSection = airConditioner.CableSection,
            RecommendedFuse = airConditioner.RecommendedFuse,
            IndoorDimensions = airConditioner.IndoorDimensions,
            OutdoorDimensions = airConditioner.OutdoorDimensions,
            WeightIndoor = airConditioner.WeightIndoor,
            WeightOutdoor = airConditioner.WeightOutdoor,
            MaxPipeLength = airConditioner.MaxPipeLength,
            MaxHeightDifference = airConditioner.MaxHeightDifference,
        };
    }
    
    private static ErrorCodeDto ToDto(ErrorCode errorCode)
    {
        return new ErrorCodeDto
        {
            Id = errorCode.Id,
            AirConditionerId = errorCode.AirConditionerId,
            Code = errorCode.Code,
            ErrorName = errorCode.ErrorName,
            Description = errorCode.Description,
            Solution = errorCode.Solution,
            Severity = errorCode.ErrorCodeSeverity.ToString(),
        };
    }
}