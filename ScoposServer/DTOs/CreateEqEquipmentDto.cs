// ============================================================================
// DTO (DATA TRANSFER OBJECT) ДЛЯ СОЗДАНИЯ НОВОГО ОБОРУДОВАНИЯ
// ============================================================================

using System.ComponentModel.DataAnnotations;

namespace ScoposServer.DTOs;

/// <summary>
/// DTO для создания новой записи оборудования в системе
/// Все поля опциональны (nullable), кроме Code - обязательный уникальный идентификатор
/// </summary>
public class CreateEqEquipmentDto
{
    /// <summary>УНИКАЛЬНЫЙ КОД ОБОРУДОВАНИЯ (обязательное поле)</summary>
    /// <remarks>Первичный ключ в БД. Должен быть уникальным. Пример: "EQ001"</remarks>
    [Required(ErrorMessage = "Код оборудования обязателен для заполнения")]
    public string Code { get; set; } = null!;

    /// <summary>Код 3D-модели оборудования</summary>
    /// <remarks>Связь с моделью в системе визуализации. Пример: "MDL-1001"</remarks>
    public string? ModelCode { get; set; }

    /// <summary>Наименование оборудования</summary>
    /// <remarks>Полное техническое название. Пример: "Компрессор центробежный Н-101"</remarks>
    public string? Name { get; set; }

    /// <summary>Тип оборудования</summary>
    /// <remarks>Категория: Compressor, Pump, Vessel, Column, Furnace и т.д.</remarks>
    public string? Type { get; set; }

    // ========================================================================
    // ИЕРАРХИЯ (РОДИТЕЛЬСКИЕ ОБЪЕКТЫ)
    // ========================================================================

    /// <summary>Код родительского оборудования/установки</summary>
    public string? ParentCode { get; set; }

    /// <summary>Наименование родительского оборудования/установки</summary>
    public string? ParentName { get; set; }

    // ========================================================================
    // КЛАССИФИКАЦИЯ
    // ========================================================================

    /// <summary>Код классификатора оборудования</summary>
    public string? ClassCode { get; set; }

    /// <summary>Наименование класса оборудования</summary>
    /// <remarks>Пример: "Компрессорное оборудование", "Насосное оборудование"</remarks>
    public string? ClassName { get; set; }

    // ========================================================================
    // ПРИНАДЛЕЖНОСТЬ К ПОДРАЗДЕЛЕНИЯМ
    // ========================================================================

    /// <summary>Код производственного подразделения</summary>
    public string? PrDepCode { get; set; }

    /// <summary>Наименование производственного подразделения</summary>
    public string? PrDepName { get; set; }

    /// <summary>Код филиала/цеха</summary>
    public string? BranchCode { get; set; }

    /// <summary>Наименование филиала/цеха</summary>
    public string? BranchName { get; set; }

    // ========================================================================
    // ТЕХНИЧЕСКИЕ ХАРАКТЕРИСТИКИ
    // ========================================================================

    /// <summary>Инвентарный номер</summary>
    /// <remarks>Внутренний учетный номер предприятия</remarks>
    public string? InventoryNumber { get; set; }

    /// <summary>Изготовитель (производитель)</summary>
    public string? Manufacturer { get; set; }

    /// <summary>Заводской серийный номер</summary>
    public string? SerialNumber { get; set; }

    // ========================================================================
    // ПРОИЗВОДСТВЕННЫЕ ДАННЫЕ
    // ========================================================================

    /// <summary>Год изготовления</summary>
    public string? ProductYear { get; set; }

    /// <summary>Месяц изготовления</summary>
    public string? ProductMonth { get; set; }

    /// <summary>Дата ввода в эксплуатацию</summary>
    public DateTime? ComissioningDate { get; set; }

    /// <summary>Местоположение/установки</summary>
    /// <remarks>Физическое расположение на объекте</remarks>
    public string? Location { get; set; }
}