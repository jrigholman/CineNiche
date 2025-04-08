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
    }
}