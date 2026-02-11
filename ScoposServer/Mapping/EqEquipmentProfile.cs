using AutoMapper;
using ScoposServer.Domain.Entities;
using ScoposServer.DTOs;

namespace ScoposServer.Mapping;

/// <summary>Профиль AutoMapper для оборудования</summary>
public class EqEquipmentProfile : Profile
{
    public EqEquipmentProfile()
    {
        // ===== 1. КРАТКИЙ МАППИНГ: Оборудование -> Short DTO (для списков) =====
        // Автоматически маппит поля с одинаковыми именами:
        // Code → Code, ModelCode → ModelCode, Name → Name, ClassName → ClassName,
        // Manufacturer → Manufacturer, InventoryNumber → InventoryNumber, Location → Location
        // Используется для отображения в таблицах, выпадающих списках, карточках-превью
        CreateMap<EqEquipment, EqEquipmentShortDto>();

        // ===== 2. ПОЛНЫЙ МАППИНГ: Оборудование -> Passport DTO (паспорт) =====
        // Автоматически маппит все 19 полей паспорта с одинаковыми именами:
        // Code, ModelCode, Name, Type, ClassCode, ClassName, ParentCode, ParentName,
        // InventoryNumber, Manufacturer, SerialNumber, ProductYear, ProductMonth,
        // ComissioningDate, BranchName, PrDepName, Location, UserStat, SystemStat
        // Используется для детального просмотра оборудования
        CreateMap<EqEquipment, EqEquipmentPassportDto>();

        // ===== 3. ОБРАТНЫЙ МАППИНГ: Create DTO -> Оборудование (создание записи) =====
        // Маппит поля из DTO создания в сущность БД:
        // Code, ModelCode, Name, Type, ParentCode, ParentName, ClassCode, ClassName,
        // PrDepCode, PrDepName, BranchCode, BranchName, InventoryNumber, Manufacturer,
        // SerialNumber, ProductYear, ProductMonth, ComissioningDate, Location
        CreateMap<CreateEqEquipmentDto, EqEquipment>()
            // Явное указание: при создании IsDel = false (оборудование активно)
            // src игнорируется, т.к. поле IsDel отсутствует в DTO
            .ForMember(dest => dest.IsDel,
                      opt => opt.MapFrom(_ => false));
    }
}