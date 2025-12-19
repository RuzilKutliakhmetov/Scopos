namespace ScoposServer.DTOs;

public class EqEquipmentPassportDto
{
    public string Code { get; set; } = null!;
    public string? ModelCode { get; set; }

    public string? Name { get; set; }
    public string? Type { get; set; }

    public string? ClassCode { get; set; }
    public string? ClassName { get; set; }

    public string? ParentCode { get; set; }
    public string? ParentName { get; set; }

    public string? InventoryNumber { get; set; }
    public string? Manufacturer { get; set; }
    public string? SerialNumber { get; set; }

    public string? ProductYear { get; set; }
    public string? ProductMonth { get; set; }
    public DateTime? ComissioningDate { get; set; }

    public string? BranchName { get; set; }
    public string? PrDepName { get; set; }
    public string? Location { get; set; }

    public string? UserStat { get; set; }
    public string? SystemStat { get; set; }
}
