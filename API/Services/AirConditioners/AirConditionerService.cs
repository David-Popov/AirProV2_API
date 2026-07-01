using ValidationException = FluentValidation.ValidationException;
using API.Common;
using API.Data;
using API.Data.Entities;
using API.DTOs;
using API.Models;
using API.Repositories;
using Mapster;
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

    public async Task<Guid> AddAirConditionerAsync(CreateAirConditionerDto dto)
    {
        try
        {
            var existing = await _context.AirConditioners
                .AsNoTracking()
                .FirstOrDefaultAsync(ac => ac.Brand == dto.Brand && ac.Model == dto.Model);

            if (existing != null)
            {
                throw new ValidationException($"An air conditioner with brand '{dto.Brand}' and model '{dto.Model}' already exists.");
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
            return airConditioner.Id;
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
                throw new NotFoundException("Air conditioner not found");
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
                throw new NotFoundException("Air conditioner not found");
            }
            
            return entity.Adapt<AirConditionerDto>();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<PagedList<AirConditionerDto>> GetAirConditionersAsync(AirConditionerParameters parameters)
    {
        try
        {
            var query = _context.AirConditioners.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(parameters.SearchTerm))
            {
                var term = parameters.SearchTerm.ToLower().Trim();
                query = query.Where(ac => 
                    ac.Name.ToLower().Contains(term) || 
                    ac.Brand.ToLower().Contains(term) || 
                    ac.Model.ToLower().Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(parameters.Brand))
            {
                var brand = parameters.Brand.ToLower().Trim();
                query = query.Where(ac => ac.Brand.ToLower() == brand);
            }

            if (parameters.MinPrice.HasValue)
            {
                query = query.Where(ac => ac.Price >= parameters.MinPrice.Value);
            }

            if (parameters.MaxPrice.HasValue)
            {
                query = query.Where(ac => ac.Price <= parameters.MaxPrice.Value);
            }

            if (parameters.MinKilowatts.HasValue)
            {
                query = query.Where(ac => ac.Kilowatts >= parameters.MinKilowatts.Value);
            }

            if (parameters.MaxKilowatts.HasValue)
            {
                query = query.Where(ac => ac.Kilowatts <= parameters.MaxKilowatts.Value);
            }

            var dtoQuery = query.ProjectToType<AirConditionerDto>();

            return await PagedList<AirConditionerDto>.CreateAsync(dtoQuery, parameters);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<Guid> AddErrorCodeAsync(CreateErrorCodeDto dto)
    {
        try
        {
            var existing = await _context.ErrorCodes
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.AirConditionerId == dto.AirConditionerId && e.Code == dto.Code);

            if (existing != null)
            {
                throw new ValidationException($"An error code '{dto.Code}' already exists for this air conditioner.");
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
            return errorCode.Id;
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
                throw new NotFoundException("Error code not found");
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
            // SQL projection (not Adapt) so the AirConditioner JOIN is generated and
            // AirConditionerName is populated — consistent with the list endpoints.
            var dto = await _context.ErrorCodes
                .AsNoTracking()
                .Where(e => e.Id == errorCodeId)
                .ProjectToType<ErrorCodeDto>()
                .FirstOrDefaultAsync();

            if (dto is null)
            {
                throw new NotFoundException("Error code not found");
            }

            return dto;
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
                .ProjectToType<ErrorCodeDto>();
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
                .ProjectToType<ErrorCodeDto>();
            return await PagedList<ErrorCodeDto>.CreateAsync(query, pageParameters);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<ErrorCodeStatsDto> GetErrorCodeStatsAsync()
    {
        try
        {
            // Aggregate over the whole catalog at the SQL level — no rows materialized.
            return await _context.ErrorCodes
                .AsNoTracking()
                .GroupBy(_ => 1)
                .Select(g => new ErrorCodeStatsDto
                {
                    Total = g.Count(),
                    WithSolutions = g.Count(e => e.Solution != null && e.Solution.Trim() != ""),
                    AirConditioners = g.Select(e => e.AirConditionerId)
                        .Where(id => id != null)
                        .Distinct()
                        .Count()
                })
                .FirstOrDefaultAsync() ?? new ErrorCodeStatsDto();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

}