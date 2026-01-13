namespace PlotCAD.Application.DTOs.Common
{
    public class ListResponse<T>
    {
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public IEnumerable<T> Items { get; set; }  = Enumerable.Empty<T>();

        public ListResponse() { }

        public ListResponse(int totalCount, int pageNumber, int pageSize, IEnumerable<T> items)
        {
            Items = items.ToList();
            TotalCount = totalCount;
            PageNumber = pageNumber;
            PageSize = pageSize;
        }
    }
}
