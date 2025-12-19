using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ScoposServer.Domain.Entities;

[Table("EqEquipment")]
public class EqEquipment
{
    [Key]
    public string Code { get; set; } = null!;

    // 🔗 Связь с 3D-моделью
    public string? ModelCode { get; set; }

    public string? Name { get; set; }
    public string? Type { get; set; }
    public bool IsDel { get; set; }

    public string? ParentCode { get; set; }
    public string? ParentName { get; set; }
    public string? ParentType { get; set; }

    public string? ClassCode { get; set; }
    public string? ClassName { get; set; }
    public string? ClassType { get; set; }

    public string? PrDepCode { get; set; }
    public string? PrDepName { get; set; }

    public string? BranchCode { get; set; }
    public string? BranchName { get; set; }

    public string? InventoryNumber { get; set; }
    public string? Manufacturer { get; set; }
    public string? SerialNumber { get; set; }

    public string? ProductYear { get; set; }
    public string? ProductMonth { get; set; }
    public DateTime? ComissioningDate { get; set; }

    public string? UserStat { get; set; }
    public string? SystemStat { get; set; }

    public string? MvzCode { get; set; }
    public string? MvzName { get; set; }

    public string? Location { get; set; }

    // EBP
    public string? EpbObjectCode { get; set; }
    public string? EpbComplexCode { get; set; }
    public string? EpbTypeNameCode { get; set; }
    public DateTime? EpbDate { get; set; }
    public DateTime? EpbNextDate { get; set; }
    public DateTime? EpbNextDatePlan { get; set; }
}