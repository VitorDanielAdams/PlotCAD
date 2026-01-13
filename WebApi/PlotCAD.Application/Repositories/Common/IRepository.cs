namespace PlotCAD.Application.Repositories.Common
{
    public interface IRepository<T> where T : class
    {
        Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<T?> GetByIdIncludingDeletedAsync(int id, CancellationToken cancellationToken = default);
        Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<T>> GetAllIncludingDeletedAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<T>> GetDeletedAsync(CancellationToken cancellationToken = default);
        Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);
        Task UpdateAsync(T entity, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
        Task RestoreAsync(int id, CancellationToken cancellationToken = default);
        Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);
        Task<bool> ExistsIncludingDeletedAsync(int id, CancellationToken cancellationToken = default);
        Task<bool> IsDeletedAsync(int id, CancellationToken cancellationToken = default);
        Task<int> CountAsync(CancellationToken cancellationToken = default);
        Task<int> CountIncludingDeletedAsync(CancellationToken cancellationToken = default);
        Task<int> CountDeletedAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<T>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
        Task<IEnumerable<T>> GetPagedIncludingDeletedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    }
}
