using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ScoposServer.Domain.Entities;

[Table("EqNotify")]
public class EqNotify
{
    [Key]
    public string QmCode { get; set; } = null!; // Код уведомления

    public string FeCode { get; set; } = null!; // Код функционального элемента
    public string EoCode { get; set; } = null!; // Код оборудования

    public string? QmType { get; set; } // Тип уведомления
    public string? QmGrpCode { get; set; } // Группа кода уведомления
    public string? QmGrpName { get; set; } // Название группы уведомления
    public string? QmCodCode { get; set; } // Код кода уведомления
    public string? QmCodName { get; set; } // Название кода уведомления

    public string? Organization { get; set; } // Организация

    public string? FeGrpCode { get; set; } // Группа функционального элемента
    public string? FeGrpName { get; set; } // Название группы ФЭ
    public string? FeCodCode { get; set; } // Код ФЭ
    public string? FeCodName { get; set; } // Название ФЭ
    public string? FeName { get; set; } // Название функционального элемента

    public string? Criticality { get; set; } // Критичность
    public string? EliminationStatus { get; set; } // Статус устранения
    public DateTime? EliminationDate { get; set; } // Дата устранения
    public string? RepairStatus { get; set; } // Статус ремонта

    // "Order" - зарезервированное слово в C#, лучше переименовать
    public string? Order { get; set; } // Приказ/распоряжение
}