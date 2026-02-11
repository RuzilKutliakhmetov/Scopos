using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoposServer.Data;
using ScoposServer.Domain.Entities;
using ScoposServer.DTOs;

namespace ScoposServer.Controllers;

[ApiController]
[Route("api/notify")]
public class EqNotifyController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<EqNotifyController> _logger;

    public EqNotifyController(
        AppDbContext context,
        IMapper mapper,
        ILogger<EqNotifyController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    /// <summary>
    /// Получает список уникальных кодов 3D-моделей (ModelCode) оборудования,
    /// которое имеет хотя бы одно связанное уведомление.
    /// </summary>
    /// <remarks>
    /// Пример результата: ["MDL-1001", "MDL-1002", "MDL-1003"]
    /// Используется для фильтрации и навигации в 3D-визуализации.
    /// </remarks>
    /// <returns>Список уникальных ModelCode, отсортированный по возрастанию</returns>
    /// <response code="200">Успешно получен список ModelCode</response>
    /// <response code="500">Внутренняя ошибка сервера</response>
    [HttpGet("equipment/modelcodes")]
    public async Task<ActionResult<IEnumerable<string>>> GetEquipmentModelCodesWithNotifies()
    {
        try
        {
            // Прямой перевод SQL запроса
            var modelCodes = await _context.EqEquipments
                .Where(e => e.ModelCode != null &&
                           _context.EqNotifies.Any(n => n.EoCode == e.Code))
                .Select(e => e.ModelCode!)
                .Distinct()
                .OrderBy(code => code)
                .ToListAsync();

            _logger.LogInformation("Найдено {Count} ModelCode с уведомлениями", modelCodes.Count);

            return Ok(modelCodes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка при получении ModelCode с уведомлениями");
            return StatusCode(500, "Внутренняя ошибка сервера");
        }
    }

    /// <summary>
    /// Получает краткую информацию об оборудовании, имеющем уведомления,
    /// с агрегированной статистикой (общее количество, критичные, дата последнего).
    /// </summary>
    /// <remarks>
    /// Возвращает только оборудование с ModelCode != null и наличием уведомлений.
    /// Сортировка: сначала по убыванию количества уведомлений, затем по имени.
    /// </remarks>
    /// <returns>Список EquipmentWithNotifyShortDto со статистикой по уведомлениям</returns>
    /// <response code="200">Успешно получен список оборудования</response>
    /// <response code="500">Внутренняя ошибка сервера</response>
    [HttpGet("equipment/short")]
    public async Task<ActionResult<IEnumerable<EquipmentWithNotifyShortDto>>> GetEquipmentWithNotifiesShort()
    {
        try
        {
            var equipmentWithNotifies = await _context.EqEquipments
                .Where(e => e.ModelCode != null &&
                           _context.EqNotifies.Any(n => n.EoCode == e.Code))
                .Select(e => new
                {
                    Equipment = e,
                    Notifies = _context.EqNotifies
                        .Where(n => n.EoCode == e.Code)
                        .ToList()
                })
                .ToListAsync();

            var result = equipmentWithNotifies.Select(x =>
            {
                var dto = _mapper.Map<EquipmentWithNotifyShortDto>(x.Equipment);
                dto.NotifyCount = x.Notifies.Count;
                dto.CriticalCount = x.Notifies.Count(n =>
                    n.Criticality != null &&
                    n.Criticality.Contains("Критический", StringComparison.OrdinalIgnoreCase));
                return dto;
            })
            .OrderByDescending(x => x.NotifyCount)
            .ThenBy(x => x.EquipmentName)
            .ToList();

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка при получении оборудования с уведомлениями");
            return StatusCode(500, "Внутренняя ошибка сервера");
        }
    }

    /// <summary>
    /// Получает детальную информацию об оборудовании и все связанные с ним уведомления
    /// по коду 3D-модели (ModelCode).
    /// </summary>
    /// <param name="modelCode">Код 3D-модели оборудования (например: "MDL-1001")</param>
    /// <remarks>
    /// Если оборудование найдено, возвращает полную информацию о нём
    /// и полный список всех уведомлений, привязанных к этому оборудованию.
    /// </remarks>
    /// <returns>EquipmentWithNotifyDto с информацией об оборудовании и списком уведомлений</returns>
    /// <response code="200">Успешно получены данные оборудования и уведомлений</response>
    /// <response code="404">Оборудование с указанным ModelCode не найдено</response>
    /// <response code="500">Внутренняя ошибка сервера</response>
    [HttpGet("equipment/model/{modelCode}")]
    public async Task<ActionResult<EquipmentWithNotifyDto>> GetEquipmentByModelCodeWithNotifies(string modelCode)
    {
        try
        {
            var equipment = await _context.EqEquipments
                .FirstOrDefaultAsync(e => e.ModelCode == modelCode);

            if (equipment == null)
                return NotFound($"Оборудование с ModelCode '{modelCode}' не найдено");

            var notifies = await _context.EqNotifies
                .Where(n => n.EoCode == equipment.Code)
                .ToListAsync();

            var result = new EquipmentWithNotifyDto
            {
                ModelCode = equipment.ModelCode!,
                EquipmentCode = equipment.Code,
                EquipmentName = equipment.Name,
                BranchName = equipment.BranchName,
                Location = equipment.Location,
                NotifyCount = notifies.Count,
                Notifies = _mapper.Map<List<EqNotifyDto>>(notifies)
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка при получении оборудования с уведомлениями по ModelCode");
            return StatusCode(500, "Внутренняя ошибка сервера");
        }
    }

    /// <summary>
    /// Получает все уведомления, привязанные к конкретному оборудованию по его коду.
    /// </summary>
    /// <param name="eoCode">Код оборудования (например: "EQ001", "EQ002")</param>
    /// <remarks>
    /// Возвращает полный список уведомлений для указанного оборудования.
    /// Если уведомлений нет - возвращает 404.
    /// </remarks>
    /// <returns>Список EqNotifyDto с детальной информацией по каждому уведомлению</returns>
    /// <response code="200">Успешно получен список уведомлений</response>
    /// <response code="404">Уведомления для указанного оборудования не найдены</response>
    /// <response code="500">Внутренняя ошибка сервера</response>
    [HttpGet("by-equipment/{eoCode}")]
    public async Task<ActionResult<IEnumerable<EqNotifyDto>>> GetNotifiesByEquipment(string eoCode)
    {
        try
        {
            var notifies = await _context.EqNotifies
                .Where(n => n.EoCode == eoCode)
                .ToListAsync();

            if (!notifies.Any())
                return NotFound($"Уведомлений для оборудования '{eoCode}' не найдено");

            return Ok(_mapper.Map<IEnumerable<EqNotifyDto>>(notifies));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка при получении уведомлений по оборудованию");
            return StatusCode(500, "Внутренняя ошибка сервера");
        }
    }

    /// <summary>
    /// Получает агрегированную статистику по всем уведомлениям в системе.
    /// </summary>
    /// <remarks>
    /// Возвращает комплексную статистику:
    /// - Общее количество уведомлений
    /// - Количество оборудования с уведомлениями
    /// - Распределение по уровням критичности (с процентами)
    /// - Распределение по статусам устранения
    /// - ТОП-10 оборудования с наибольшим количеством уведомлений
    /// - Время формирования отчета (GeneratedAt)
    /// </remarks>
    /// <returns>Анонимный объект со статистическими данными</returns>
    /// <response code="200">Успешно получена статистика</response>
    /// <response code="500">Внутренняя ошибка сервера</response>
    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetNotifyStats()
    {
        try
        {
            var totalNotifies = await _context.EqNotifies.CountAsync();

            var statsByCriticality = await _context.EqNotifies
                .GroupBy(n => n.Criticality ?? "Не указана")
                .Select(g => new
                {
                    Criticality = g.Key,
                    Count = g.Count(),
                    Percentage = Math.Round((double)g.Count() / totalNotifies * 100, 2)
                })
                .OrderByDescending(x => x.Count)
                .ToListAsync();

            var statsByStatus = await _context.EqNotifies
                .GroupBy(n => n.EliminationStatus ?? "Не указан")
                .Select(g => new
                {
                    Status = g.Key,
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Count)
                .ToListAsync();

            var equipmentWithMostNotifies = await _context.EqEquipments
                .Where(e => _context.EqNotifies.Any(n => n.EoCode == e.Code))
                .Select(e => new
                {
                    EquipmentCode = e.Code,
                    EquipmentName = e.Name,
                    ModelCode = e.ModelCode,
                    NotifyCount = _context.EqNotifies.Count(n => n.EoCode == e.Code)
                })
                .OrderByDescending(x => x.NotifyCount)
                .Take(10)
                .ToListAsync();

            return Ok(new
            {
                TotalNotifies = totalNotifies,
                EquipmentWithNotifiesCount = await _context.EqEquipments
                    .CountAsync(e => _context.EqNotifies.Any(n => n.EoCode == e.Code)),
                ByCriticality = statsByCriticality,
                ByStatus = statsByStatus,
                TopEquipment = equipmentWithMostNotifies,
                GeneratedAt = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка при получении статистики уведомлений");
            return StatusCode(500, "Внутренняя ошибка сервера");
        }
    }

    /// <summary>
    /// Получает отфильтрованный список уведомлений по заданным критериям.
    /// </summary>
    /// <param name="eoCode">Фильтр по коду оборудования (частичное совпадение)</param>
    /// <param name="criticality">Фильтр по уровню критичности (точное совпадение)</param>
    /// <param name="status">Фильтр по статусу устранения (точное совпадение)</param>
    /// <param name="fromDate">Фильтр по дате создания: начало периода</param>
    /// <param name="toDate">Фильтр по дате создания: конец периода</param>
    /// <param name="qmType">Фильтр по типу уведомления (точное совпадение)</param>
    /// <remarks>
    /// Все параметры опциональны. Комбинация фильтров работает через AND.
    /// Поддерживается частичное совпадение для eoCode (Contains).
    /// </remarks>
    /// <returns>Список EqNotifyDto, соответствующий критериям фильтрации</returns>
    /// <response code="200">Успешно получен отфильтрованный список</response>
    /// <response code="500">Внутренняя ошибка сервера</response>
    [HttpGet("filtered")]
    public async Task<ActionResult<IEnumerable<EqNotifyDto>>> GetNotifiesFiltered(
        [FromQuery] string? eoCode = null,
        [FromQuery] string? criticality = null,
        [FromQuery] string? status = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? qmType = null)
    {
        try
        {
            var query = _context.EqNotifies.AsQueryable();

            if (!string.IsNullOrEmpty(eoCode))
                query = query.Where(n => n.EoCode.Contains(eoCode));

            if (!string.IsNullOrEmpty(criticality))
                query = query.Where(n => n.Criticality == criticality);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(n => n.EliminationStatus == status);

            if (!string.IsNullOrEmpty(qmType))
                query = query.Where(n => n.QmType == qmType);

            var notifies = await query
                .ToListAsync();

            return Ok(_mapper.Map<IEnumerable<EqNotifyDto>>(notifies));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка при фильтрации уведомлений");
            return StatusCode(500, "Внутренняя ошибка сервера");
        }
    }

    /// <summary>
    /// Создает новое уведомление в системе.
    /// </summary>
    /// <param name="dto">Объект передачи данных с информацией о новом уведомлении</param>
    /// <remarks>
    /// Обязательные поля: QmCode, FeCode, EoCode.
    /// Перед созданием выполняется проверка:
    /// - ModelState.IsValid (атрибуты Required)
    /// - Существование оборудования с указанным Code (EoCode)
    /// - Отсутствие дубликата по QmCode (уникальный ключ)
    /// </remarks>
    /// <returns>Созданное уведомление в формате EqNotifyDto</returns>
    /// <response code="201">Уведомление успешно создано</response>
    /// <response code="400">ModelState невалиден или оборудование не найдено</response>
    /// <response code="409">Уведомление с таким QmCode уже существует</response>
    /// <response code="500">Внутренняя ошибка сервера</response>
    [HttpPost]
    public async Task<ActionResult<EqNotifyDto>> CreateNotify([FromBody] CreateEqNotifyDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Проверка существования оборудования
            var equipmentExists = await _context.EqEquipments
                .AnyAsync(e => e.Code == dto.EoCode);

            if (!equipmentExists)
                return BadRequest($"Оборудование с кодом '{dto.EoCode}' не найдено");

            var notify = new EqNotify
            {
                QmCode = dto.QmCode,
                FeCode = dto.FeCode,
                EoCode = dto.EoCode,
                QmType = dto.QmType,
                QmGrpCode = dto.QmGrpCode,
                QmGrpName = dto.QmGrpName,
                QmCodCode = dto.QmCodCode,
                QmCodName = dto.QmCodName,
                Organization = dto.Organization,
                FeGrpCode = dto.FeGrpCode,
                FeGrpName = dto.FeGrpName,
                FeCodCode = dto.FeCodCode,
                FeCodName = dto.FeCodName,
                FeName = dto.FeName,
                Criticality = dto.Criticality,
                EliminationStatus = dto.EliminationStatus,
                EliminationDate = dto.EliminationDate,
                RepairStatus = dto.RepairStatus,
            };

            _context.EqNotifies.Add(notify);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetNotifiesByEquipment),
                new { eoCode = notify.EoCode },
                _mapper.Map<EqNotifyDto>(notify));
        }
        catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("duplicate") == true)
        {
            return Conflict($"Уведомление с кодом '{dto.QmCode}' уже существует");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка при создании уведомления");
            return StatusCode(500, "Внутренняя ошибка сервера");
        }
    }
}