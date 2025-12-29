namespace ScoposServer.DTOs;

public class EqNotifyDto
{
    public string QmCode { get; set; } = null!;
    public string FeCode { get; set; } = null!;
    public string EoCode { get; set; } = null!;
    public string? QmType { get; set; }
    public string? QmGrpName { get; set; }
    public string? QmCodName { get; set; }
    public string? Organization { get; set; }
    public string? FeName { get; set; }
    public string? Criticality { get; set; }
    public string? EliminationStatus { get; set; }
    public DateTime? EliminationDate { get; set; }
    public string? RepairStatus { get; set; }
    public string? OrderInfo { get; set; }
    public DateTime? CreatedDate { get; set; }
}

public class EquipmentWithNotifyDto
{
    public string ModelCode { get; set; } = null!;
    public string EquipmentCode { get; set; } = null!;
    public string? EquipmentName { get; set; }
    public string? BranchName { get; set; }
    public string? Location { get; set; }
    public int NotifyCount { get; set; }
    public List<EqNotifyDto> Notifies { get; set; } = new();
}

public class EquipmentWithNotifyShortDto
{
    public string ModelCode { get; set; } = null!;
    public string EquipmentCode { get; set; } = null!;
    public string? EquipmentName { get; set; }
    public string? ClassName { get; set; }
    public string? Manufacturer { get; set; }
    public string? Location { get; set; }
    public int NotifyCount { get; set; }
    public int CriticalCount { get; set; }
    public DateTime? LastNotifyDate { get; set; }
}