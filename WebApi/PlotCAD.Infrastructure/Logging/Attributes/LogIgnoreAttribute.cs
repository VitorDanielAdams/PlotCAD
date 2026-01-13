namespace PlotCAD.Infrastructure.Logging.Attributes
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
    public sealed class LogIgnoreAttribute : Attribute
    {
    }
}
