using AutoMapper;
using ScoposServer.Domain.Entities;
using ScoposServer.DTOs;

namespace ScoposServer.Mapping;

public class EqNotifyProfile : Profile
{
    public EqNotifyProfile()
    {
        CreateMap<EqNotify, EqNotifyDto>();

        CreateMap<EqEquipment, EquipmentWithNotifyShortDto>()
            .ForMember(dest => dest.EquipmentCode, opt => opt.MapFrom(src => src.Code))
            .ForMember(dest => dest.NotifyCount, opt => opt.Ignore())
            .ForMember(dest => dest.CriticalCount, opt => opt.Ignore())
            .ForMember(dest => dest.LastNotifyDate, opt => opt.Ignore());
    }
}