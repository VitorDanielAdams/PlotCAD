using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Entities;
using PlotCAD.Domain.Entities.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Linq.Expressions;

namespace PlotCAD.Infrastructure.Contexts
{
    public class AppDbContext : DbContext
    {
        private readonly ICurrentUserService _currentUserService;
        public AppDbContext(DbContextOptions<AppDbContext> options, ICurrentUserService currentUser)
            : base(options) => _currentUserService = currentUser;

        public DbSet<User> Users => Set<User>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            ConfigureUserEntity(modelBuilder);

            ConfigureModel(modelBuilder);
        }

        private void ConfigureModel(ModelBuilder modelBuilder)
        {
            foreach (var entityType in modelBuilder.Model.GetEntityTypes()
                .Where(e => typeof(BaseEntity).IsAssignableFrom(e.ClrType)))
            {
                var clrType = entityType.ClrType;

                modelBuilder.Entity(clrType)
                    .Property("Id")
                    .ValueGeneratedOnAdd();

                modelBuilder.Entity(clrType)
                    .Property(nameof(BaseEntity.TenantId))
                    .IsRequired();

                modelBuilder.Entity(clrType)
                    .HasIndex(nameof(BaseEntity.TenantId));

                var parameter = Expression.Parameter(clrType, "e");
                var tenantProperty = Expression.Property(parameter, nameof(BaseEntity.TenantId));
                var tenantId = Expression.Constant(_currentUserService.GetTenantId());
                var body = Expression.Equal(tenantProperty, tenantId);
                var lambda = Expression.Lambda(body, parameter);

                modelBuilder.Entity(clrType).HasQueryFilter(lambda);
            }
        }

        private void ConfigureUserEntity(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");

                entity.Property(u => u.Name)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(u => u.Email)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(u => u.PasswordHash)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(u => u.Role)
                    .HasConversion<string>()
                    .HasMaxLength(20);

                entity.HasIndex(u => new { u.TenantId, u.Email })
                    .IsUnique();

                entity.HasIndex(u => u.Role);
                entity.HasIndex(u => u.Name);
            });
        }
        public override int SaveChanges()
        {
            UpdateTimestamps();
            SetTenantIds();
            return base.SaveChanges();
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateTimestamps();
            SetTenantIds();
            return await base.SaveChangesAsync(cancellationToken);
        }

        private void SetTenantIds()
        {
            var entries = ChangeTracker.Entries<BaseEntity>();

            foreach (var entry in entries)
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.TenantId = _currentUserService.GetTenantId();
                }
                else if (entry.State == EntityState.Modified)
                {
                    entry.Property(nameof(BaseEntity.TenantId)).IsModified = false;
                }
            }
        }

        private void UpdateTimestamps()
        {
            var entries = ChangeTracker.Entries<BaseEntity>();

            foreach (var entry in entries)
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    entry.Entity.DeletedAt = null;
                }
                else if (entry.State == EntityState.Modified)
                {
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                }
                else if (entry.State == EntityState.Deleted && entry.Entity is BaseEntity softDeleteEntity)
                {
                    entry.State = EntityState.Modified;
                    softDeleteEntity.DeletedAt = DateTime.UtcNow;
                    softDeleteEntity.UpdatedAt = DateTime.UtcNow;
                }
            }
        }
    }
}