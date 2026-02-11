using AutoMapper;
using ScoposServer.Domain.Entities;
using ScoposServer.DTOs;

namespace ScoposServer.Mapping;

/// <summary>Профиль AutoMapper для уведомлений и связанного оборудования</summary>
public class EqNotifyProfile : Profile
{
    public EqNotifyProfile()
    {
        // ===== 1. ПОЛНЫЙ МАППИНГ: Уведомление -> DTO =====
        // Автоматически маппит все поля с одинаковыми именами:
        // QmCode, FeCode, EoCode, Criticality, EliminationStatus и т.д.
        CreateMap<EqNotify, EqNotifyDto>();

        // ===== 2. ЧАСТИЧНЫЙ МАППИНГ: Оборудование -> DTO со статистикой =====
        // Маппятся только базовые поля из EqEquipment:
        // - ModelCode → ModelCode
        // - Code → EquipmentCode (явно)
        // - Name → EquipmentName
        // - ClassName → ClassName
        // - Manufacturer → Manufacturer  
        // - Location → Location
        CreateMap<EqEquipment, EquipmentWithNotifyShortDto>()
            // Явное указание (для читаемости)
            .ForMember(dest => dest.EquipmentCode,
                      opt => opt.MapFrom(src => src.Code))

            // СТАТИСТИЧЕСКИЕ ПОЛЯ: игнорируются, т.к. вычисляются в запросе
            // Заполняются вручную в контроллере через Count(), Max()
            .ForMember(dest => dest.NotifyCount,     // Общее кол-во уведомлений
                      opt => opt.Ignore())
            .ForMember(dest => dest.CriticalCount,   // Кол-во критических
                      opt => opt.Ignore())
            .ForMember(dest => dest.LastNotifyDate,  // Дата последнего
                      opt => opt.Ignore());
    }
}