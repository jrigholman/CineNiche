using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CineNiche.API.Data;
using CineNiche.API.DTOs;

namespace CineNiche.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MoviesController : ControllerBase
    {
        private readonly MoviesDbContext _context;

        public MoviesController(MoviesDbContext context)
        {
            _context = context;
        }
        
        [HttpGet("titles")]
        public async Task<ActionResult<List<MovieTitleDto>>> GetMovieTitles()
        {
            // Log the request
            Console.WriteLine("API Request: Get all movie titles");
            
            var movies = await _context.Movies  
                .OrderBy(m => m.title ?? string.Empty)
                .ToListAsync();
            
            // Log how many movies were found
            Console.WriteLine($"Found {movies.Count} movies in the database");
            
            // Sample log of the first few movies to see what data is available
            if (movies.Count > 0)
            {
                for (int i = 0; i < Math.Min(3, movies.Count); i++)
                {
                    var movie = movies[i];
                    Console.WriteLine($"Sample Movie {i+1}: " +
                        $"ID={movie.show_id}, " +
                        $"Title={movie.title ?? "null"}, " +
                        $"Director={movie.director ?? "null"}, " +
                        $"Cast={movie.cast?.Substring(0, Math.Min(20, movie.cast?.Length ?? 0)) ?? "null"}...");
                }
            }
            
            var movieDtos = movies.Select(m => MovieTitleDto.FromEntity(m)).ToList();
            
            return Ok(movieDtos);
        }

        [HttpGet("titles/paged")]
        public async Task<ActionResult<object>> GetMovieTitlesPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            // Validate parameters
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;
            
            // Log the request
            Console.WriteLine($"API Request: Get paginated movie titles - Page {page}, PageSize {pageSize}");
            
            // Get total count for pagination info
            var totalCount = await _context.Movies.CountAsync();
            
            // Calculate how many pages exist
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
            
            // Get the requested page of movies
            var movies = await _context.Movies
                .OrderBy(m => m.title ?? string.Empty)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            // Log how many movies were found
            Console.WriteLine($"Found {movies.Count} movies for page {page} (total count: {totalCount})");
            
            var movieDtos = movies.Select(m => MovieTitleDto.FromEntity(m)).ToList();
            
            // Return both the movies and pagination info
            var result = new {
                movies = movieDtos,
                pagination = new {
                    currentPage = page,
                    pageSize = pageSize,
                    totalPages = totalPages,
                    totalCount = totalCount,
                    hasNext = page < totalPages,
                    hasPrevious = page > 1
                }
            };
            
            return Ok(result);
        }

        [HttpGet("titles/{id}")]
        [ProducesResponseType(typeof(MovieTitleDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<MovieTitleDto>> GetMovieTitle(string id)
        {
            // Log the request
            Console.WriteLine($"API Request: Get movie title with ID: {id}");
            
            var movie = await _context.Movies.FindAsync(id);

            if (movie == null)
            {
                Console.WriteLine($"Movie with ID {id} not found");
                return NotFound();
            }
            
            // Log the movie data that was found
            Console.WriteLine($"Found movie: " +
                $"ID={movie.show_id}, " +
                $"Title={movie.title ?? "null"}, " + 
                $"Director={movie.director ?? "null"}, " +
                $"Cast={movie.cast?.Substring(0, Math.Min(20, movie.cast?.Length ?? 0)) ?? "null"}..., " +
                $"Country={movie.country ?? "null"}, " +
                $"Description={movie.description?.Substring(0, Math.Min(20, movie.description?.Length ?? 0)) ?? "null"}...");
            
            var movieDto = MovieTitleDto.FromEntity(movie);
            
            return Ok(movieDto);
        }

        [HttpGet("users")]
        public async Task<ActionResult<List<MovieUserDto>>> GetUsers()
        {
            return await _context.Users
                .OrderBy(u => u.name ?? string.Empty)
                .Select(u => MovieUserDto.FromEntity(u))
                .ToListAsync();
        }

        [HttpGet("users/{id}")]
        public async Task<ActionResult<MovieUserDto>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            return user == null ? NotFound() : Ok(MovieUserDto.FromEntity(user));
        }
        
        [HttpGet("ratings/{showId}")]
        public async Task<ActionResult<List<MovieRatingDto>>> GetRatingsForMovie(string showId)
        {
            var ratings = await _context.Ratings
                .Where(r => r.show_id == showId)
                .Select(r => new MovieRatingDto
                {
                    user_id = r.user_id,
                    show_id = r.show_id,
                    rating = r.rating ?? 0
                })
                .ToListAsync();
                
            return Ok(ratings);
        }
        
        [HttpGet("ratings/user/{userId}")]
        public async Task<ActionResult<List<MovieRatingDto>>> GetUserRatings(int userId)
        {
            var ratings = await _context.Ratings
                .Where(r => r.user_id == userId)
                .Select(r => new MovieRatingDto
                {
                    user_id = r.user_id,
                    show_id = r.show_id,
                    rating = r.rating ?? 0
                })
                .ToListAsync();
                
            return Ok(ratings);
        }
        
        [HttpGet("ratings/average/{showId}")]
        public async Task<ActionResult<double>> GetAverageRating(string showId)
        {
            var ratings = await _context.Ratings
                .Where(r => r.show_id == showId && r.rating.HasValue)
                .Select(r => r.rating!.Value)
                .ToListAsync();
                
            if (!ratings.Any())
            {
                return Ok(0.0);
            }
            
            return Ok(ratings.Average());
        }
        
        // Favorites endpoints
        [HttpGet("favorites/user/{userId}")]
        public async Task<ActionResult<List<UserFavoriteDto>>> GetUserFavorites(int userId)
        {
            var favorites = await _context.Favorites
                .Where(f => f.user_id == userId)
                .Select(f => UserFavoriteDto.FromEntity(f))
                .ToListAsync();
                
            return Ok(favorites);
        }
        
        [HttpPost("favorites")]
        public async Task<ActionResult<UserFavoriteDto>> AddFavorite(UserFavoriteDto favoriteDto)
        {
            // Check if this favorite already exists
            var existingFavorite = await _context.Favorites
                .FirstOrDefaultAsync(f => f.user_id == favoriteDto.user_id && f.movie_id == favoriteDto.movie_id);
                
            if (existingFavorite != null)
            {
                return Ok(UserFavoriteDto.FromEntity(existingFavorite)); // Already exists
            }
            
            // Create new favorite
            var favorite = new UserFavorite
            {
                user_id = favoriteDto.user_id,
                movie_id = favoriteDto.movie_id
            };
            
            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetUserFavorites), new { userId = favorite.user_id }, UserFavoriteDto.FromEntity(favorite));
        }
        
        [HttpDelete("favorites/{userId}/{movieId}")]
        public async Task<IActionResult> RemoveFavorite(int userId, string movieId)
        {
            var favorite = await _context.Favorites
                .FirstOrDefaultAsync(f => f.user_id == userId && f.movie_id == movieId);
                
            if (favorite == null)
            {
                return NotFound();
            }
            
            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        // Watchlist endpoints
        [HttpGet("watchlist/user/{userId}")]
        public async Task<ActionResult<List<UserWatchlistDto>>> GetUserWatchlist(int userId)
        {
            var watchlistItems = await _context.Watchlist
                .Where(w => w.user_id == userId)
                .Select(w => UserWatchlistDto.FromEntity(w))
                .ToListAsync();
                
            return Ok(watchlistItems);
        }
        
        [HttpPost("watchlist")]
        public async Task<ActionResult<UserWatchlistDto>> AddToWatchlist(UserWatchlistDto watchlistDto)
        {
            // Check if this watchlist item already exists
            var existingItem = await _context.Watchlist
                .FirstOrDefaultAsync(w => w.user_id == watchlistDto.user_id && w.movie_id == watchlistDto.movie_id);
                
            if (existingItem != null)
            {
                return Ok(UserWatchlistDto.FromEntity(existingItem)); // Already exists
            }
            
            // Create new watchlist item
            var watchlistItem = new UserWatchlist
            {
                user_id = watchlistDto.user_id,
                movie_id = watchlistDto.movie_id
            };
            
            _context.Watchlist.Add(watchlistItem);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetUserWatchlist), new { userId = watchlistItem.user_id }, UserWatchlistDto.FromEntity(watchlistItem));
        }
        
        [HttpDelete("watchlist/{userId}/{movieId}")]
        public async Task<IActionResult> RemoveFromWatchlist(int userId, string movieId)
        {
            var watchlistItem = await _context.Watchlist
                .FirstOrDefaultAsync(w => w.user_id == userId && w.movie_id == movieId);
                
            if (watchlistItem == null)
            {
                return NotFound();
            }
            
            _context.Watchlist.Remove(watchlistItem);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
    }
}