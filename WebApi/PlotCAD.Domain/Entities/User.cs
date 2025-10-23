﻿using PlotCAD.Domain.Entities.Common;
using PlotCAD.Domain.Enums;

namespace PlotCAD.Domain.Entities
{
    public class User : AuditableEntity
    {
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public Role Role { get; set; } 
        public bool IsActive { get; set; } = true;
    }
}
