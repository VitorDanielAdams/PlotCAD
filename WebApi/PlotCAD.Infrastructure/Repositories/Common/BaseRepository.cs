using PlotCAD.Application.Repositories.Common;
using PlotCAD.Domain.Entities.Common;
using PlotCAD.Infrastructure.Contexts;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;


namespace PlotCAD.Infrastructure.Repositories.Common
{
    public class BaseRepository<T> : IRepository<T> where T : BaseEntity
    {
        protected readonly AppDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public BaseRepository(AppDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        protected virtual IQueryable<T> ApplySoftDeleteFilter(IQueryable<T> query)
        {
            return query.Where(e => e.DeletedAt == null);
        }

        public virtual async Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await ApplySoftDeleteFilter(_dbSet)
                .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
        }

        public virtual async Task<IEnumerable<T>> ListAllAsync(CancellationToken cancellationToken = default)
        {
            return await ApplySoftDeleteFilter(_dbSet)
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        public virtual async Task<IEnumerable<T>> ListWhereAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
        {
            return await ApplySoftDeleteFilter(_dbSet)
                .AsNoTracking()
                .Where(predicate)
                .ToListAsync(cancellationToken);
        }

        public virtual async Task AddAsync(T entity, CancellationToken cancellationToken = default)
        {
            entity.CreatedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;
            entity.DeletedAt = null;

            await _dbSet.AddAsync(entity, cancellationToken);
        }

        public virtual void Update(T entity)
        {
            entity.UpdatedAt = DateTime.UtcNow;
            _dbSet.Update(entity);
            _context.Entry(entity).State = EntityState.Modified;
        }

        public virtual void Delete(T entity)
        {
            entity.DeletedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;

            _dbSet.Update(entity);
            _context.Entry(entity).State = EntityState.Modified;
        }

        public virtual void Restore(T entity)
        {
            entity.DeletedAt = null;
            entity.UpdatedAt = DateTime.UtcNow;

            _dbSet.Update(entity);
            _context.Entry(entity).State = EntityState.Modified;
        }

        public virtual async Task<bool> IsDeletedAsync(int id, CancellationToken cancellationToken = default)
        {
            var entity = await _dbSet.AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

            return entity?.DeletedAt != null;
        }

        public virtual async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
        {
            return await ApplySoftDeleteFilter(_dbSet)
                .AnyAsync(e => e.Id == id, cancellationToken);
        }

        public virtual async Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
        {
            return await ApplySoftDeleteFilter(_dbSet)
                .AnyAsync(predicate, cancellationToken);
        }

        public virtual async Task<bool> ExistsIncludingDeletedAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _dbSet.AnyAsync(e => e.Id == id, cancellationToken);
        }

        public virtual async Task<bool> ExistsIncludingDeletedAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
        {
            return await _dbSet.AnyAsync(predicate, cancellationToken);
        }

        public virtual async Task<int> CountAsync(CancellationToken cancellationToken = default)
        {
            return await ApplySoftDeleteFilter(_dbSet)
                .CountAsync(cancellationToken);
        }

        public virtual async Task<int> CountAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
        {
            return await ApplySoftDeleteFilter(_dbSet)
                .CountAsync(predicate, cancellationToken);
        }

        public virtual async Task<int> CountIncludingDeletedAsync(CancellationToken cancellationToken = default)
        {
            return await _dbSet.CountAsync(cancellationToken);
        }

        public virtual async Task<int> CountIncludingDeletedAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
        {
            return await _dbSet.CountAsync(predicate, cancellationToken);
        }

        public virtual async Task<IEnumerable<T>> ListAllIncludingDeletedAsync(CancellationToken cancellationToken = default)
        {
            return await _dbSet.AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        public virtual async Task<IEnumerable<T>> ListDeletedAsync(CancellationToken cancellationToken = default)
        {
            return await _dbSet.AsNoTracking()
                .Where(e => e.DeletedAt != null)
                .ToListAsync(cancellationToken);
        }

        public virtual async Task<IEnumerable<T>> ListWhereIncludingDeletedAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
        {
            return await _dbSet.AsNoTracking()
                .Where(predicate)
                .ToListAsync(cancellationToken);
        }

        public virtual async Task<T?> GetByIdIncludingDeletedAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _dbSet.AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
        }

        public virtual async Task<IEnumerable<T>> ListPagedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
        {
            return await ApplySoftDeleteFilter(_dbSet)
                .AsNoTracking()
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);
        }

        public virtual async Task<IEnumerable<T>> ListPagedAsync(int pageNumber, int pageSize, Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
        {
            return await ApplySoftDeleteFilter(_dbSet)
                .AsNoTracking()
                .Where(predicate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);
        }

        public virtual async Task<IEnumerable<T>> ListPagedIncludingDeletedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
        {
            return await _dbSet.AsNoTracking()
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);
        }

        public virtual async Task<IEnumerable<T>> ListPagedIncludingDeletedAsync(int pageNumber, int pageSize, Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
        {
            return await _dbSet.AsNoTracking()
                .Where(predicate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);
        }

        public virtual IQueryable<T> GetQueryable()
        {
            return ApplySoftDeleteFilter(_dbSet).AsQueryable();
        }

        public virtual IQueryable<T> GetQueryableIncludingDeleted()
        {
            return _dbSet.AsQueryable();
        }
    }
}
