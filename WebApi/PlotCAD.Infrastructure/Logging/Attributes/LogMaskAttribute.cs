namespace PlotCAD.Infrastructure.Logging.Attributes
{
    [AttributeUsage(AttributeTargets.Property)]
    public sealed class LogMaskAttribute : Attribute
    {
        public int ShowFirst { get; }
        public int ShowLast { get; }
        public char MaskChar { get; }

        public LogMaskAttribute(int showFirst = 0, int showLast = 0, char maskChar = '*')
        {
            ShowFirst = showFirst;
            ShowLast = showLast;
            MaskChar = maskChar;
        }
    }
}
