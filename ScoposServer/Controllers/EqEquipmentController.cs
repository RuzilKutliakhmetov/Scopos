using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoposServer.Data;
using ScoposServer.Domain.Entities;
using ScoposServer.DTOs;

namespace ScoposServer.Controllers;

[ApiController]
[Route("api/equipment")]
public class EqEquipmentController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public EqEquipmentController(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// Получить список оборудования (для выбора модели)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EqEquipmentShortDto>>> GetAll()
    {
        var entities = await _context.EqEquipments
            .OrderBy(x => x.Name)
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<EqEquipmentShortDto>>(entities));
    }

    /// Получить паспорт оборудования по Code
    [HttpGet("{code}")]
    public async Task<ActionResult<EqEquipmentPassportDto>> GetByCode(string code)
    {
        var entity = await _context.EqEquipments
            .FirstOrDefaultAsync(x => x.ModelCode == code);

        if (entity == null)
            return NotFound();

        return Ok(_mapper.Map<EqEquipmentPassportDto>(entity));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEqEquipmentDto dto)
    {
        // проверка на дубликат Code
        var exists = await _context.EqEquipments
            .AnyAsync(x => x.Code == dto.Code);

        if (exists)
            return Conflict($"Объект с Code '{dto.Code}' уже существует");

        var entity = _mapper.Map<EqEquipment>(dto);

        _context.EqEquipments.Add(entity);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetByCode),
            new { code = entity.Code },
            null
        );
    }

    /// Получить паспорт по modelCode (из 3D-модели)
    [HttpGet("by-model/{modelCode}")]
    public async Task<ActionResult<EqEquipmentPassportDto>> GetByModelCode(string modelCode)
    {
        var entity = await _context.EqEquipments
            .FirstOrDefaultAsync(x => x.ModelCode == modelCode);

        if (entity == null)
            return NotFound($"Паспорт для модели '{modelCode}' не найден");

        return Ok(_mapper.Map<EqEquipmentPassportDto>(entity));
    }
}
