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
            var movies = await _context.Movies  
                .OrderBy(m => m.title ?? string.Empty)
                .Select(m => MovieTitleDto.FromEntity(m))
                .ToListAsync();
    
            return Ok(movies);
        }

        [HttpGet("titles/{id}")]
        [ProducesResponseType(typeof(MovieTitleDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<MovieTitleDto>> GetMovieTitle(string id)
        {
            var movie = await _context.Movies.FindAsync(id);
        
            if (movie == null)
            {
                return NotFound();
            }
            
            return Ok(MovieTitleDto.FromEntity(movie));
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