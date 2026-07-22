using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using RetrivoApi.Models;

namespace RetrivoApi.Data;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Claim> Claims { get; set; }

    public virtual DbSet<Item> Items { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Categori__3214EC079746DD94");

            entity.HasIndex(e => e.Name, "UQ__Categori__737584F6E3C1B167").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Name).HasMaxLength(50);
        });

        modelBuilder.Entity<Claim>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Claims__3214EC07B38EA2CF");

            entity.HasIndex(e => e.ItemId, "IX_Claims_ItemId");

            entity.Property(e => e.ClaimantEmail).HasMaxLength(150);
            entity.Property(e => e.ClaimantName).HasMaxLength(100);
            entity.Property(e => e.ClaimantPhone).HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Message).HasMaxLength(1000);
            entity.Property(e => e.PhotoUrl).HasMaxLength(500);

            entity.HasOne(d => d.Item).WithMany(p => p.Claims)
                .HasForeignKey(d => d.ItemId)
                .HasConstraintName("FK_Claims_Items");
        });

        modelBuilder.Entity<Item>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Items__3214EC07135D681D");

            entity.HasIndex(e => e.CategoryId, "IX_Items_CategoryId");

            entity.HasIndex(e => e.ItemType, "IX_Items_ItemType");

            entity.HasIndex(e => e.ReporterId, "IX_Items_ReporterId");

            entity.HasIndex(e => e.Status, "IX_Items_Status");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.ItemType).HasMaxLength(10);
            entity.Property(e => e.Location).HasMaxLength(200);
            entity.Property(e => e.PhotoUrl).HasMaxLength(500);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Pending");
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Category).WithMany(p => p.Items)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Items_Categories");

            entity.HasOne(d => d.Reporter).WithMany(p => p.Items)
                .HasForeignKey(d => d.ReporterId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Items_Users");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Users__3214EC07A7F39F46");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D10534045EB887").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Email).HasMaxLength(150);
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.IsAdmin).HasDefaultValue(false);
            entity.Property(e => e.PasswordHash).HasMaxLength(500);
            entity.Property(e => e.Phone).HasMaxLength(20);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
