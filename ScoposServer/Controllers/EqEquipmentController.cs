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

    /// <summary>
    /// Получает список всего активного оборудования в кратком формате.
    /// </summary>
    /// <remarks>
    /// Возвращает все оборудование, не помеченное как удаленное (IsDel = false).
    /// Сортировка по наименованию оборудования (Name) по возрастанию.
    /// Используется для выпадающих списков, таблиц обзора, навигации.
    /// </remarks>
    /// <returns>Список EqEquipmentShortDto с базовой информацией об оборудовании</returns>
    /// <response code="200">Успешно получен список оборудования</response>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EqEquipmentShortDto>>> GetAll()
    {
        var entities = await _context.EqEquipments
            .OrderBy(x => x.Name)
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<EqEquipmentShortDto>>(entities));
    }

    /// <summary>
    /// Получает полный паспорт оборудования по его уникальному коду.
    /// </summary>
    /// <param name="code">Уникальный код оборудования (например: "EQ001", "EQ032")</param>
    /// <remarks>
    /// Возвращает все технические характеристики, учетные данные, 
    /// информацию о расположении и статусах.
    /// </remarks>
    /// <returns>EqEquipmentPassportDto с полной информацией об оборудовании</returns>
    /// <response code="200">Успешно получен паспорт оборудования</response>
    /// <response code="404">Оборудование с указанным кодом не найдено</response>
    [HttpGet("{code}")]
    public async Task<ActionResult<EqEquipmentPassportDto>> GetByCode(string code)
    {
        var entity = await _context.EqEquipments
            .FirstOrDefaultAsync(x => x.Code == code);  // Было ModelCode

        if (entity == null)
            return NotFound();

        return Ok(_mapper.Map<EqEquipmentPassportDto>(entity));
    }

    /// <summary>
    /// Получает список кодов 3D-моделей (ModelCode) оборудования 
    /// с просроченной датой следующей проверки ЕПБ.
    /// </summary>
    /// <remarks>
    /// Критерий отбора: EpbNextDate меньше текущей даты (DateTime.UtcNow).
    /// Возвращаются только модели с непустым ModelCode.
    /// Используется для визуализации просроченных объектов в 3D-сцене.
    /// </remarks>
    /// <returns>Список уникальных ModelCode оборудования с просроченной ЕПБ</returns>
    /// <response code="200">Успешно получен список ModelCode</response>
    /// <response code="500">Внутренняя ошибка сервера</response>
    [HttpGet("overdue-simple")]
    public async Task<ActionResult<IEnumerable<string>>> GetOverdueModelCodesSimple()
    {
        try
        {
            var modelCodes = await _context.EqEquipments
                .Where(x => x.ModelCode != null && x.EpbNextDate < DateTime.UtcNow)
                .Select(x => x.ModelCode!)
                .ToListAsync();

            return Ok(modelCodes);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Внутренняя ошибка сервера  {ex.ToString()}");
        }
    }

    /// <summary>
    /// Создает новую запись оборудования в системе.
    /// </summary>
    /// <param name="dto">Объект передачи данных с информацией о новом оборудовании</param>
    /// <remarks>
    /// Обязательное поле: Code (уникальный идентификатор).
    /// 
    /// Валидация:
    /// - Проверка на существование оборудования с таким Code
    /// - При успехе: IsDel автоматически устанавливается в false
    /// 
    /// Остальные поля опциональны и маппятся из DTO в сущность автоматически.
    /// </remarks>
    /// <returns>Статус 201 (Created) с ссылкой на GetByCode</returns>
    /// <response code="201">Оборудование успешно создано</response>
    /// <response code="409">Оборудование с указанным Code уже существует</response>
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

    /// <summary>
    /// Получает полный паспорт оборудования по коду 3D-модели.
    /// </summary>
    /// <param name="modelCode">Код 3D-модели оборудования (например: "MDL-1001", "MDL-1032")</param>
    /// <remarks>
    /// Используется для интеграции с CAD/3D-системами.
    /// По коду модели находит соответствующее оборудование и возвращает его паспорт.
    /// </remarks>
    /// <returns>EqEquipmentPassportDto с полной информацией об оборудовании</returns>
    /// <response code="200">Успешно получен паспорт оборудования</response>
    /// <response code="404">Паспорт для указанной модели не найден</response>
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
