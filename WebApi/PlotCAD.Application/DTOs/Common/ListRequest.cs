namespace PlotCAD.Application.DTOs.Common
{
    public class ListRequest
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; }
        public bool Descending { get; set; } = false;
    }

    public class ListRequest<T> : ListRequest
    {
        public T? Filter { get; set; }  
    }
}
