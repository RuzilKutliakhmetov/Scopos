using Microsoft.EntityFrameworkCore;
using ScoposServer.Domain.Entities;

namespace ScoposServer.Data;
public class AppDbContext : DbContext
{
    public DbSet<EqEquipment> EqEquipments => Set<EqEquipment>();
    public DbSet<EqNotify> EqNotifies => Set<EqNotify>();

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<EqEquipment>()
            .HasKey(x => x.Code);

        // глобальный фильтр: не отдаём удалённые
        modelBuilder.Entity<EqEquipment>()
            .HasQueryFilter(x => !x.IsDel);

        modelBuilder.Entity<EqNotify>()
            .HasKey(x => x.QmCode);
    }
}
