using PlotCAD.Infrastructure.Logging.Attributes;
using System.Collections;
using System.Reflection;
using System.Text;

namespace PlotCAD.Infrastructure.Logging.Extensions
{
    public static class LogStringExtensions
    {
        private const int DefaultMaxDepth = 3;

        public static string ToLogString(this object? obj, int maxDepth = DefaultMaxDepth)
        {
            var visited = new HashSet<object>(ReferenceEqualityComparer.Instance);
            return BuildLogString(obj, 0, maxDepth, visited);
        }

        private static string BuildLogString(
            object? obj,
            int currentDepth,
            int maxDepth,
            HashSet<object> visited)
        {
            if (obj is null)
                return "null";

            if (currentDepth > maxDepth)
                return "...";

            var type = obj.GetType();

            if (IsSimple(type))
                return obj.ToString()!;

            if (!visited.Add(obj))
                return "[Circular Reference]";

            if (obj is IEnumerable enumerable && obj is not string)
            {
                var sbCollection = new StringBuilder();
                sbCollection.AppendLine("[");

                foreach (var item in enumerable)
                {
                    sbCollection.AppendLine(
                        $"{Indent(currentDepth + 1)}- {BuildLogString(item, currentDepth + 1, maxDepth, visited)}"
                    );
                }

                sbCollection.Append($"{Indent(currentDepth)}]");
                return sbCollection.ToString();
            }

            var sb = new StringBuilder();
            sb.AppendLine($"{type.Name}");
            sb.AppendLine($"{Indent(currentDepth)}{{");

            foreach (var prop in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
            {
                if (!prop.CanRead)
                    continue;

                if (Attribute.IsDefined(prop, typeof(LogIgnoreAttribute)))
                    continue;

                var value = prop.GetValue(obj);

                var maskAttr = prop.GetCustomAttribute<LogMaskAttribute>();
                if (maskAttr != null)
                {
                    var maskedValue = ApplyMask(value, maskAttr);
                    sb.AppendLine(
                        $"{Indent(currentDepth + 1)}{prop.Name}: {maskedValue}"
                    );
                    continue;
                }

                sb.AppendLine(
                    $"{Indent(currentDepth + 1)}{prop.Name}: {BuildLogString(value, currentDepth + 1, maxDepth, visited)}"
                );
            }

            sb.Append($"{Indent(currentDepth)}}}");

            return sb.ToString();
        }

        private static bool IsSimple(Type type)
        {
            return
                type.IsPrimitive ||
                type.IsEnum ||
                type == typeof(string) ||
                type == typeof(decimal) ||
                type == typeof(DateTime) ||
                type == typeof(Guid) ||
                type == typeof(DateTimeOffset);
        }
        private static string ApplyMask(object? value, LogMaskAttribute attr)
        {
            if (value == null)
                return "null";

            var str = value.ToString() ?? string.Empty;

            if (str.Length == 0)
                return string.Empty;

            var showFirst = Math.Min(attr.ShowFirst, str.Length);
            var showLast = Math.Min(attr.ShowLast, str.Length - showFirst);

            var maskedLength = str.Length - showFirst - showLast;
            if (maskedLength <= 0)
                return str;

            return
                str.Substring(0, showFirst) +
                new string(attr.MaskChar, maskedLength) +
                str.Substring(str.Length - showLast);
        }

        private static string Indent(int depth)
            => new string(' ', depth * 2);
    }
}
