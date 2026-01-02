using API.Data.Entities;
using API.Data.Seeds;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : base(options)
    {
        
    }
    
    public DbSet<AirConditioner> AirConditioners { get; set; }
    
    public DbSet<ErrorCode> ErrorCodes { get; set; }
    
    public DbSet<Montage> Montages { get; set; }
    
    public DbSet<Company> Companies { get; set; }
    
    public DbSet<InventoryItem> InventoryItems { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        builder.Entity<Company>(entity =>
        {
            entity.HasKey(e => e.Id);
        
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");
            entity.HasIndex(e => e.IsActive).HasDatabaseName("idx_companies_is_active");
            entity.HasIndex(e => e.Bulstat).HasDatabaseName("idx_companies_bulstat");
        });

        builder.Entity<ApplicationUser>(entity =>
        {
            entity.HasOne(u => u.Company)
                .WithMany(c => c.Users)
                .HasForeignKey(u => u.CompanyId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    
        // AirConditioner configuration
        builder.Entity<AirConditioner>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");
            
            entity.HasIndex(e => e.Brand).HasDatabaseName("idx_air_conditioners_brand");
            entity.HasIndex(e => e.Model).HasDatabaseName("idx_air_conditioners_model");
        });
    
        // ErrorCode configuration
        builder.Entity<ErrorCode>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");
            
            entity.HasIndex(e => e.AirConditionerId).HasDatabaseName("idx_error_codes_air_conditioner_id");
            entity.HasIndex(e => e.Code).HasDatabaseName("idx_error_codes_error_code");
            
            entity.HasOne(e => e.AirConditioner)
                  .WithMany(a => a.ErrorCodes)
                  .HasForeignKey(e => e.AirConditionerId)
                  .OnDelete(DeleteBehavior.SetNull);
        });
    
        // Montage configuration
        builder.Entity<Montage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");
            
            entity.HasIndex(e => e.CompanyId).HasDatabaseName("idx_montages_company_id");
            entity.HasIndex(e => e.UserId).HasDatabaseName("idx_montages_user_id");
            entity.HasIndex(e => e.AirConditionerId).HasDatabaseName("idx_montages_air_conditioner_id");
            entity.HasIndex(e => e.Status).HasDatabaseName("idx_montages_status");
            entity.HasIndex(e => e.InstallationDate).HasDatabaseName("idx_montages_installation_date");
            entity.HasIndex(e => e.ClientName).HasDatabaseName("idx_montages_client_name");
            
            entity.HasOne(e => e.AirConditioner)
                  .WithMany()
                  .HasForeignKey(e => e.AirConditionerId)
                  .OnDelete(DeleteBehavior.SetNull);
        });
    
        // InventoryItem configuration
        builder.Entity<InventoryItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");
            
            entity.HasIndex(e => e.CompanyId).HasDatabaseName("idx_inventory_items_company_id");
            entity.HasIndex(e => e.Name).HasDatabaseName("idx_inventory_items_name");
            entity.HasIndex(e => e.Sku).HasDatabaseName("idx_inventory_items_sku");
            entity.HasIndex(e => e.IsActive).HasDatabaseName("idx_inventory_items_is_active");
            entity.HasIndex(e => new { e.CompanyId, e.Name }).IsUnique().HasDatabaseName("idx_inventory_items_company_name_unique");
            
            entity.HasOne(e => e.Company)
                  .WithMany(c => c.InventoryItems)
                  .HasForeignKey(e => e.CompanyId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}