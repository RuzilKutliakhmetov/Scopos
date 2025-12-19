namespace ScoposServer.DTOs;
public class EqEquipmentShortDto
{
    public string Code { get; set; } = null!;
    public string? ModelCode { get; set; }
    public string? Name { get; set; }
    public string? ClassName { get; set; }
    public string? Manufacturer { get; set; }
    public string? InventoryNumber { get; set; }
    public string? Location { get; set; }
}
