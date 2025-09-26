using System.Linq.Expressions;

namespace PlotCAD.Application.Repositories.Common
{
    public interface IRepository<T> where T : class
    {
        Task<T?> GetByIdIncludingDeletedAsync(int id, CancellationToken cancellationToken = default);
        Task<IEnumerable<T>> ListAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<T>> ListAllIncludingDeletedAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<T>> ListWhereAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
        Task<IEnumerable<T>> ListWhereIncludingDeletedAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);

        Task AddAsync(T entity, CancellationToken cancellationToken = default);
        void Update(T entity);
        void Delete(T entity);
        void Restore(T entity);

        Task<IEnumerable<T>> ListDeletedAsync(CancellationToken cancellationToken = default);
        Task<bool> IsDeletedAsync(int id, CancellationToken cancellationToken = default);

        Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);
        Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
        Task<bool> ExistsIncludingDeletedAsync(int id, CancellationToken cancellationToken = default);
        Task<bool> ExistsIncludingDeletedAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);

        Task<int> CountAsync(CancellationToken cancellationToken = default);
        Task<int> CountAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
        Task<int> CountIncludingDeletedAsync(CancellationToken cancellationToken = default);
        Task<int> CountIncludingDeletedAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);

        Task<IEnumerable<T>> ListPagedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
        Task<IEnumerable<T>> ListPagedAsync(int pageNumber, int pageSize, Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
        Task<IEnumerable<T>> ListPagedIncludingDeletedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
        Task<IEnumerable<T>> ListPagedIncludingDeletedAsync(int pageNumber, int pageSize, Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);

        IQueryable<T> GetQueryable();
        IQueryable<T> GetQueryableIncludingDeleted();
    }
}
