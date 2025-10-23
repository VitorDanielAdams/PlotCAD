﻿namespace PlotCAD.WebApi.Reponses
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public T? Data { get; set; }
        public List<string>? Errors { get; set; }

        public static ApiResponse<T> Ok(T data, string? message = null) =>
            new() { Success = true, Message = message, Data = data };

        public static ApiResponse<object?> Ok(string? message = null) =>
            new() { Success = true, Message = message, Data = default };

        public static ApiResponse<T> Fail(string message, List<string>? errors = null) =>
            new() { Success = false, Message = message, Errors = errors };
    }
}
