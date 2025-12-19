using AutoMapper;
using ScoposServer.Domain.Entities;
using ScoposServer.DTOs;

namespace ScoposServer.Mapping;
public class EqEquipmentProfile : Profile
{
    public EqEquipmentProfile()
    {
        CreateMap<EqEquipment, EqEquipmentShortDto>();

        CreateMap<EqEquipment, EqEquipmentPassportDto>();

        CreateMap<CreateEqEquipmentDto, EqEquipment>()
            .ForMember(dest => dest.IsDel, opt => opt.MapFrom(_ => false));
    }
}