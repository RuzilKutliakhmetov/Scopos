using Microsoft.EntityFrameworkCore;
using ScoposServer.Domain.Entities;

namespace ScoposServer.Data;

/// <summary>КОНТЕКСТ БАЗЫ ДАННЫХ - связующее звено между Entity и БД</summary>
public class AppDbContext : DbContext
{
    // ===== 1. ТАБЛИЦЫ (DbSet) =====

    /// <summary>Таблица оборудования</summary>
    /// <remarks>Доступ: _context.EqEquipments</remarks>
    public DbSet<EqEquipment> EqEquipments => Set<EqEquipment>();

    /// <summary>Таблица уведомлений</summary>
    /// <remarks>Доступ: _context.EqNotifies</remarks>
    public DbSet<EqNotify> EqNotifies => Set<EqNotify>();

    // ===== 2. КОНСТРУКТОР =====

    /// <summary>Принимает настройки подключения из Program.cs</summary>
    /// <param name="options">UseNpgsql(connectionString)</param>
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) // Передаём настройки в базовый класс
    {
    }

    // ===== 3. КОНФИГУРАЦИЯ МОДЕЛЕЙ =====

    /// <summary>Настройка маппинга Entity → таблицы БД</summary>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ----- 3.1 ПЕРВИЧНЫЕ КЛЮЧИ -----

        // EqEquipment: Code - первичный ключ
        modelBuilder.Entity<EqEquipment>()
            .HasKey(x => x.Code);

        // EqNotify: QmCode - первичный ключ  
        modelBuilder.Entity<EqNotify>()
            .HasKey(x => x.QmCode);

        // ----- 3.2 ГЛОБАЛЬНЫЙ ФИЛЬТР (SOFT DELETE) -----

        // Автоматически исключает удалённое оборудование из ВСЕХ запросов
        // WHERE IsDel = false добавляется к каждому запросу к EqEquipments
        modelBuilder.Entity<EqEquipment>()
            .HasQueryFilter(x => !x.IsDel);

    }
}