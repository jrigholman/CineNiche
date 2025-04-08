// Models/MovieTitle.cs

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class MovieTitle
{
    [Key]
    public string show_id { get; set; } = null!; // Primary key - required
    
    public string? type { get; set; }
    public string? title { get; set; }
    public string? director { get; set; }
    public string? cast { get; set; }
    public string? country { get; set; }
    public int? release_year { get; set; } // Made nullable
    public string? rating { get; set; }
    public string? duration { get; set; }
    public string? description { get; set; }
    
    // For your genre boolean columns (example for a few)
    /*public bool? IsAction { get; set; }
    public bool? IsComedy { get; set; }
    public bool? IsDrama { get; set; }*/
    // Add all other genre flags as nullable
}