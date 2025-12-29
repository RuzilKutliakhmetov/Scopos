using System.ComponentModel.DataAnnotations;

namespace ScoposServer.DTOs;

public class CreateEqNotifyDto
{
    [Required]
    public string QmCode { get; set; } = null!;

    [Required]
    public string FeCode { get; set; } = null!;

    [Required]
    public string EoCode { get; set; } = null!;

    public string? QmType { get; set; }
    public string? QmGrpCode { get; set; }
    public string? QmGrpName { get; set; }
    public string? QmCodCode { get; set; }
    public string? QmCodName { get; set; }
    public string? Organization { get; set; }
    public string? FeGrpCode { get; set; }
    public string? FeGrpName { get; set; }
    public string? FeCodCode { get; set; }
    public string? FeCodName { get; set; }
    public string? FeName { get; set; }
    public string? Criticality { get; set; }
    public string? EliminationStatus { get; set; }
    public DateTime? EliminationDate { get; set; }
    public string? RepairStatus { get; set; }
    public string? OrderInfo { get; set; }
}