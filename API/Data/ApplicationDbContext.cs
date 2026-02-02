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
    
    public DbSet<MontageInventoryItem> MontageInventoryItems { get; set; }
    
    public DbSet<MontagePhoto> MontagePhotos { get; set; }

    public DbSet<InventoryAuditLog> InventoryAuditLogs { get; set; }
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

        // MontageInventoryItem configuration - links montages to inventory items
        builder.Entity<MontageInventoryItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            
            entity.HasIndex(e => e.MontageId).HasDatabaseName("idx_montage_inventory_montage_id");
            entity.HasIndex(e => e.InventoryItemId).HasDatabaseName("idx_montage_inventory_item_id");
            
            entity.HasOne(e => e.Montage)
                  .WithMany(m => m.UsedMaterials)
                  .HasForeignKey(e => e.MontageId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasOne(e => e.InventoryItem)
                  .WithMany(i => i.MontageUsages)
                  .HasForeignKey(e => e.InventoryItemId)
                  .OnDelete(DeleteBehavior.Restrict); // Cannot delete inventory item if used in montage
        });

        // MontagePhoto configuration - photos attached to montages
        builder.Entity<MontagePhoto>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            
            entity.HasIndex(e => e.MontageId).HasDatabaseName("idx_montage_photos_montage_id");
            entity.HasIndex(e => new { e.MontageId, e.DisplayOrder }).HasDatabaseName("idx_montage_photos_order");
            
            entity.HasOne(e => e.Montage)
                  .WithMany(m => m.Photos)
                  .HasForeignKey(e => e.MontageId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // InventoryAuditLog configuration - tracks all inventory changes
        builder.Entity<InventoryAuditLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            
            entity.HasIndex(e => e.CompanyId).HasDatabaseName("idx_inventory_audit_company_id");
            entity.HasIndex(e => e.InventoryItemId).HasDatabaseName("idx_inventory_audit_item_id");
            entity.HasIndex(e => e.UserId).HasDatabaseName("idx_inventory_audit_user_id");
            entity.HasIndex(e => e.Action).HasDatabaseName("idx_inventory_audit_action");
            entity.HasIndex(e => e.CreatedAt).HasDatabaseName("idx_inventory_audit_created_at");
            entity.HasIndex(e => e.RelatedMontageId).HasDatabaseName("idx_inventory_audit_montage_id");
            
            entity.HasOne(e => e.Company)
                  .WithMany()
                  .HasForeignKey(e => e.CompanyId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasOne(e => e.InventoryItem)
                  .WithMany(i => i.AuditLogs)
                  .HasForeignKey(e => e.InventoryItemId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.SetNull);
                  
            entity.HasOne(e => e.RelatedMontage)
                  .WithMany()
                  .HasForeignKey(e => e.RelatedMontageId)
                  .OnDelete(DeleteBehavior.SetNull);
        });
    }
}