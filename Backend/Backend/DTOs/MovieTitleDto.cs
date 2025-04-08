namespace CineNiche.API.DTOs
{
    public class MovieTitleDto
    {
        public string show_id { get; set; } = null!;
        public string? title { get; set; }
        public string? director { get; set; }
        public int? release_year { get; set; }
        public string? rating { get; set; }
        
        public static MovieTitleDto FromEntity(MovieTitle entity)
        {
            return new MovieTitleDto
            {
                show_id = entity.show_id,
                title = entity.title,
                director = entity.director,
                release_year = entity.release_year,
                rating = entity.rating
            };
        }
    }
}