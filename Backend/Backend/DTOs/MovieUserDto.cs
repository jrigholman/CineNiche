using CineNiche.API.Data;

namespace CineNiche.API.DTOs
{
    public class MovieUserDto
    {

        public int user_id { get; set; } // Primary key - required
        public string name { get; set; }
        public string email { get; set; }
        public string phone { get; set; }
        public int age { get; set; }
        public string gender { get; set; }
        public string city { get; set; }
        public string state { get; set; }
        public string password { get; set; }

        public static MovieUserDto FromEntity(MovieUser entity)
        {
            return new MovieUserDto
            {
                user_id = entity.user_id,
                name = entity.name,
                phone = entity.phone,
                email = entity.email,
                age = entity.age,
                gender = entity.gender,
                city = entity.city,
                state = entity.state,
                password = entity.password
            };
        }
    }
}