import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlusCircle } from 'lucide-react';
// Individual imports for react-icons to avoid type errors
import { FaHeart } from 'react-icons/fa';
import { FaRegHeart } from 'react-icons/fa';
import { FaBookmark } from 'react-icons/fa';
import { FaRegBookmark } from 'react-icons/fa';
import { FaCheck } from 'react-icons/fa';
import { FaSearch } from 'react-icons/fa';
import { FaChevronDown } from 'react-icons/fa';
import { moviesApi, MovieTitle } from '../services/api';

export type Movie = {
  id: string;
  title: string;
  year: number;
  genres: string[];
  contentType: string; // 'Movie' or 'TV Series'
  poster: string;
  description: string;
  contentRating: string;
  director: string;
  imdbRating: number;
  averageRating?: number;
  ratingCount?: number;
};

// Define updated interface for MovieItem to match Movie id type
export interface MovieItem {
  id: string;
  title: string;
  imageUrl: string;
  genre: string;
  year: number;
}

// Convert backend MovieTitle to frontend Movie format
const convertToMovie = (movieTitle: MovieTitle): Movie => {
  return {
    id: movieTitle.show_id,
    title: movieTitle.title || 'Untitled',
    year: movieTitle.release_year || 0,
    genres: ['Drama'], // Default genre since backend doesn't have this yet
    contentType: 'Movie', // Default type since backend doesn't have this yet
    poster: `https://via.placeholder.com/300x450?text=${encodeURIComponent(movieTitle.title || 'Movie')}`,
    description: 'No description available', // Backend doesn't have this yet
    contentRating: movieTitle.rating || 'NR',
    director: movieTitle.director || 'Unknown',
    imdbRating: 0, // Backend doesn't have this yet
    averageRating: 0, // Will be populated from ratings if available
    ratingCount: 0 // Will be populated from ratings if available
  };
};

// Sample movie data as fallback
const sampleMovies: Movie[] = [
  {
    id: "1",
    title: "Inception",
    year: 2010,
    genres: ["Action", "Sci-Fi", "Thriller"],
    contentType: "Movie",
    poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    contentRating: "PG-13",
    director: "Christopher Nolan",
    imdbRating: 8.8,
    averageRating: 4.5,
    ratingCount: 42
  },
  {
    id: "2",
    title: "The Dark Knight",
    year: 2008,
    genres: ["Action", "Crime", "Drama"],
    contentType: "Movie",
    poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    contentRating: "PG-13",
    director: "Christopher Nolan",
    imdbRating: 9.0,
    averageRating: 4.8,
    ratingCount: 78
  },
  {
    id: "3",
    title: "Stranger Things",
    year: 2016,
    genres: ["Drama", "Fantasy", "Horror"],
    contentType: "TV Series",
    poster: "https://m.media-amazon.com/images/M/MV5BN2ZmYjg1YmItNWQ4OC00YWM0LWE0ZDktYThjOTZiZjhhN2Q2XkEyXkFqcGdeQXVyNjgxNTQ3Mjk@._V1_SX300.jpg",
    description: "When a young boy disappears, his mother, a police chief, and his friends must confront terrifying supernatural forces in order to get him back.",
    contentRating: "TV-14",
    director: "The Duffer Brothers",
    imdbRating: 8.7,
    averageRating: 4.6,
    ratingCount: 56
  },
  {
    id: "4",
    title: "Interstellar",
    year: 2014,
    genres: ["Adventure", "Drama", "Sci-Fi"],
    contentType: "Movie",
    poster: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    contentRating: "PG-13",
    director: "Christopher Nolan",
    imdbRating: 8.6,
    averageRating: 4.3,
    ratingCount: 38
  },
  {
    id: "5",
    title: "Breaking Bad",
    year: 2008,
    genres: ["Crime", "Drama", "Thriller"],
    contentType: "TV Series",
    poster: "https://m.media-amazon.com/images/M/MV5BMjhiMzgxZTctNDc1Ni00OTIxLTlhMTYtZTA3ZWFkODRkNmE2XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
    description: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
    contentRating: "TV-MA",
    director: "Vince Gilligan",
    imdbRating: 9.5,
    averageRating: 4.9,
    ratingCount: 92
  },
  {
    id: "6",
    title: "The Shawshank Redemption",
    year: 1994,
    genres: ["Drama"],
    contentType: "Movie",
    poster: "https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    contentRating: "R",
    director: "Frank Darabont",
    imdbRating: 9.3,
    averageRating: 4.7,
    ratingCount: 63
  }
];

const MoviesPage: React.FC = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All Genres');
  const [selectedContentType, setSelectedContentType] = useState<string>('All Types');
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const [isContentTypeDropdownOpen, setIsContentTypeDropdownOpen] = useState(false);
  const [collectionFilter, setCollectionFilter] = useState<string>('All');
  const [isCollectionDropdownOpen, setIsCollectionDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { isAuthenticated, favorites, watchlist, isAdmin } = useAuth();
  
  // Computed properties for button states
  const isInFavorites = collectionFilter === 'Favorites';
  const isInWatchlist = collectionFilter === 'Watchlist';
  
  const genreDropdownRef = useRef<HTMLDivElement>(null);
  const contentTypeDropdownRef = useRef<HTMLDivElement>(null);
  const collectionDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch movies from API
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        console.log('Attempting to fetch movies from API');
        const movieTitles = await moviesApi.getAllMovies();
        
        if (movieTitles.length > 0) {
          // Convert backend data to frontend format
          const convertedMovies = movieTitles.map(convertToMovie);
          setMovies(convertedMovies);
          setFilteredMovies(convertedMovies);
        } else {
          // Use sample data as fallback
          console.log('No movies returned from API, using sample data');
          setMovies(sampleMovies);
          setFilteredMovies(sampleMovies);
          setError('Could not fetch movies. Using sample data instead.');
        }
      } catch (err) {
        console.error('Error fetching movies:', err);
        // More detailed error message
        const errorMessage = err instanceof Error 
          ? `API connection error: ${err.message}. Using sample data instead.`
          : 'Error loading movies. Using sample data instead.';
        setError(errorMessage);
        setMovies(sampleMovies);
        setFilteredMovies(sampleMovies);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovies();
  }, []);

  // Extract unique genres from movies
  const uniqueGenres = useMemo(() => {
    const genres = new Set<string>();
    movies.forEach(movie => {
      movie.genres.forEach(genre => {
        genres.add(genre);
      });
    });
    return ['All Genres', ...Array.from(genres)];
  }, [movies]);

  // Extract unique content types from movies
  const contentTypes = useMemo(() => {
    const types = new Set<string>();
    movies.forEach(movie => {
      types.add(movie.contentType);
    });
    return ['All Types', ...Array.from(types)];
  }, [movies]);

  useEffect(() => {
    // Filter movies based on search term, genre, content type and collection
    let result = movies;
    
    if (searchTerm) {
      result = result.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedGenre !== 'All Genres') {
      result = result.filter(movie => 
        movie.genres.includes(selectedGenre)
      );
    }

    if (selectedContentType !== 'All Types') {
      result = result.filter(movie => 
        movie.contentType === selectedContentType
      );
    }
    
    if (collectionFilter === 'Favorites' && isAuthenticated) {
      result = result.filter(movie => favorites.some(fav => fav.id === movie.id));
    } else if (collectionFilter === 'Watchlist' && isAuthenticated) {
      result = result.filter(movie => watchlist.some(item => item.id === movie.id));
    }
    
    setFilteredMovies(result);
  }, [searchTerm, selectedGenre, selectedContentType, collectionFilter, movies, isAuthenticated, favorites, watchlist]);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target as Node)) {
        setIsGenreDropdownOpen(false);
      }
      
      if (contentTypeDropdownRef.current && !contentTypeDropdownRef.current.contains(event.target as Node)) {
        setIsContentTypeDropdownOpen(false);
      }
      
      if (collectionDropdownRef.current && !collectionDropdownRef.current.contains(event.target as Node)) {
        setIsCollectionDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle genre selection
  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
    setIsGenreDropdownOpen(false);
  };

  // Handle content type selection
  const handleContentTypeSelect = (contentType: string) => {
    setSelectedContentType(contentType);
    setIsContentTypeDropdownOpen(false);
  };

  // Handle collection filter selection
  const handleCollectionSelect = (filter: string) => {
    setCollectionFilter(filter);
    setIsCollectionDropdownOpen(false);
  };

  // Navigate to add movie page
  const handleAddMovie = () => {
    navigate('/movies/add');
  };

  return (
    <div className="page-container movies-page">
      <div className="header-with-actions">
        <h1>Browse Collection</h1>
        
        <div className="header-buttons">
          {isAuthenticated && (
            <div className="collection-buttons">
              <button 
                className={`collection-toggle-btn ${isInFavorites ? 'active' : ''}`}
                onClick={() => handleCollectionSelect(isInFavorites ? 'All' : 'Favorites')}
              >
                {isInFavorites ? <FaHeart /> : <FaRegHeart />} Favorites
              </button>
              <button 
                className={`collection-toggle-btn ${isInWatchlist ? 'active' : ''}`}
                onClick={() => handleCollectionSelect(isInWatchlist ? 'All' : 'Watchlist')}
              >
                {isInWatchlist ? <FaBookmark /> : <FaRegBookmark />} Watchlist
              </button>
            </div>
          )}
          
          {isAdmin && (
            <button className="btn-primary add-movie-btn" onClick={handleAddMovie}>
              <PlusCircle size={18} /> Add Movie
            </button>
          )}
        </div>
      </div>
      
      <div className="filters-container">
        <div className="filter-section-wrapper">
          <div className="filter-label">Search</div>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon-container">
              <FaSearch className="search-icon" />
            </span>
          </div>
        </div>
        
        <div className="filter-section-wrapper">
          <div className="filter-label">Filter</div>
          <div className="filter-section">
            {/* Genre Filter */}
            <div className="filter-dropdown" ref={genreDropdownRef}>
              <div 
                className={`custom-dropdown ${isGenreDropdownOpen ? 'active' : ''}`} 
                onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
              >
                <div className="selected-option">
                  {selectedGenre} <FaChevronDown className="dropdown-arrow" />
                </div>
                {isGenreDropdownOpen && (
                  <div className="dropdown-options">
                    {uniqueGenres.map((genre) => (
                      <div 
                        key={genre} 
                        className={`dropdown-option ${selectedGenre === genre ? 'selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGenre(genre);
                          setIsGenreDropdownOpen(false);
                        }}
                      >
                        {genre}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Content Type Filter */}
            <div className="filter-dropdown" ref={contentTypeDropdownRef}>
              <div 
                className={`custom-dropdown ${isContentTypeDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsContentTypeDropdownOpen(!isContentTypeDropdownOpen)}
              >
                <div className="selected-option">
                  {selectedContentType} <FaChevronDown className="dropdown-arrow" />
                </div>
                {isContentTypeDropdownOpen && (
                  <div className="dropdown-options">
                    {contentTypes.map((type) => (
                      <div 
                        key={type} 
                        className={`dropdown-option ${selectedContentType === type ? 'selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContentType(type);
                          setIsContentTypeDropdownOpen(false);
                        }}
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading movies...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="movie-grid">
            {filteredMovies.slice(0, 12).map(movie => (
              <div key={movie.id} className="movie-card">
                <Link to={`/movies/${movie.id}`}>
                  <div className="movie-card-inner">
                    <img src={movie.poster} alt={movie.title} />
                    <div className="movie-info">
                      <h3>{movie.title}</h3>
                      <div className="movie-card-footer">
                        <span className="movie-year">{movie.year}</span>
                        <div className="movie-genre">
                          {movie.genres.slice(0, 2).map((genre, index) => (
                            <span key={index} className="movie-genre-pill">{genre}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          
          {filteredMovies.length > 12 && (
            <div className="load-more">
              <button 
                onClick={() => {}} 
                className="btn-primary"
              >
                Load More
              </button>
            </div>
          )}
          
          {filteredMovies.length === 0 && (
            <div className="no-results">
              <p>No movies found matching your criteria.</p>
              <button onClick={() => {
                setSearchTerm(''); 
                setSelectedGenre('All Genres');
                setSelectedContentType('All Types');
              }} className="btn-secondary">
                Clear Filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MoviesPage; 