namespace PlotCAD.Common.Attributes;

[AttributeUsage(AttributeTargets.Property)]
public class LogMaskAttribute : Attribute
{
    public int ShowFirst { get; set; } = 2;
    public int ShowLast { get; set; } = 2;
    public char MaskChar { get; set; } = '*';
}
