namespace CineNiche.API.DTOs
{
    public class MovieTitleDto
    {
        public string show_id { get; set; } = null!;
        public string? type { get; set; }
        public string? title { get; set; }
        public string? director { get; set; }
        public string? cast { get; set; }
        public string? country { get; set; }
        public int? release_year { get; set; }
        public string? rating { get; set; }
        public string? duration { get; set; }
        public string? description { get; set; }
        public List<string> Categories { get; set; } = new();
        
        public static MovieTitleDto FromEntity(MovieTitle entity)
        {
            return new MovieTitleDto
            {
                show_id = entity.show_id,
                type = entity.type,
                title = entity.title,
                director = entity.director,
                cast = entity.cast,
                country = entity.country,
                release_year = entity.release_year,
                rating = entity.rating,
                duration = entity.duration,
                description = entity.description,
                Categories = entity.ActiveCategories
            };
        }
    }
}