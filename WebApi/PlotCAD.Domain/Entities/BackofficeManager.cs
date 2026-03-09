using System.ComponentModel.DataAnnotations.Schema;

namespace PlotCAD.Domain.Entities
{
    [Table("BackofficeManagers")]
    public class BackofficeManager
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? UpdatedAt { get; set; }
    }
}
