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
const convertToMovie = async (movieTitle: MovieTitle): Promise<Movie> => {
  // Clean up the title if it exists, otherwise show as "Unknown"
  const cleanTitle = movieTitle.title ? movieTitle.title.replace(/#/g, '').trim() : 'Unknown Title';
  
  // Get genres from Categories array if available - handle both camelCase and PascalCase
  const categories = movieTitle.Categories || movieTitle.categories || [];
  const genres = categories.length > 0 ? categories : ['Unknown'];
  
  // Placeholder for poster - will be populated later in batches
  let posterUrl = `/images/placeholder-movie.jpg`;
  
  // Use actual data where available, fallback to Unknown
  return {
    id: movieTitle.show_id,
    title: cleanTitle,
    year: movieTitle.release_year || 0,
    genres: genres,
    contentType: movieTitle.type || "Movie",
    poster: posterUrl,
    description: movieTitle.description || 'No description available.',
    contentRating: movieTitle.rating || 'NR',
    director: movieTitle.director || 'Unknown',
    imdbRating: 0, // No actual source for this
    averageRating: 0, // Will be populated from ratings if available
    ratingCount: 0 // Will be populated from ratings if available
  };
};

// Helper function to update posters in batches
const updatePostersInBatches = async (movies: Movie[], batchSize = 5, delay = 100): Promise<Movie[]> => {
  const updatedMovies = [...movies];
  
  // Process in small batches to avoid overwhelming the API
  for (let i = 0; i < updatedMovies.length; i += batchSize) {
    const batch = updatedMovies.slice(i, i + batchSize);
    
    // Process this batch
    await Promise.all(
      batch.map(async (movie, index) => {
        try {
          // Only fetch poster if we have a title
          if (movie.title && movie.title !== 'Unknown Title') {
            const posterUrl = await moviesApi.getMoviePosterUrl(movie.title);
            updatedMovies[i + index].poster = posterUrl;
          }
        } catch (error) {
          console.error(`Error fetching poster for ${movie.title}:`, error);
        }
      })
    );
    
    // Small delay between batches to avoid overwhelming the API
    if (i + batchSize < updatedMovies.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return updatedMovies;
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
  const [initialLoading, setInitialLoading] = useState(true); // Used for first page load
  const [loadingMore, setLoadingMore] = useState(false); // Used for subsequent page loads
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMorePages, setHasMorePages] = useState(true);
  const pageSize = 24; // Number of movies per page
  
  const { isAuthenticated, favorites, watchlist, isAdmin } = useAuth();
  
  // Computed properties for button states
  const isInFavorites = collectionFilter === 'Favorites';
  const isInWatchlist = collectionFilter === 'Watchlist';
  
  const genreDropdownRef = useRef<HTMLDivElement>(null);
  const contentTypeDropdownRef = useRef<HTMLDivElement>(null);
  const collectionDropdownRef = useRef<HTMLDivElement>(null);

  // Add a ref to track if filtering is in progress
  const isFilteringRef = useRef(false);

  // Add a state to track if we're loading initial filter results
  const [loadingFilterResults, setLoadingFilterResults] = useState(false);

  // Fetch initial page of movies from API
  useEffect(() => {
    const fetchInitialMovies = async () => {
      try {
        setInitialLoading(true);
        console.log('Fetching first page of movies');
        
        // Only get the first page of movies with pageSize=24
        const response = await moviesApi.getMoviesPaged(1, pageSize);
        console.log(`API returned ${response.movies.length} movies for page 1 with pageSize=${pageSize}`);
        
        if (response.movies.length > 0) {
          // Convert backend data to frontend format without posters
          const moviesWithoutPosters = await Promise.all(response.movies.map(convertToMovie));
          console.log(`Converted ${moviesWithoutPosters.length} movies without posters`);
          
          // Update pagination info
          setCurrentPage(response.pagination.currentPage);
          setTotalPages(response.pagination.totalPages);
          setHasMorePages(response.pagination.hasNext);
          console.log(`Pagination: page ${response.pagination.currentPage}/${response.pagination.totalPages}, hasNext: ${response.pagination.hasNext}`);
          
          // Set initial movies without posters to show UI quickly - LIMIT TO 24
          const initialMovies = moviesWithoutPosters.slice(0, pageSize);
          setMovies(initialMovies);
          setFilteredMovies(initialMovies);
          console.log(`Initially displaying ${initialMovies.length} movies`);
          
          // Then start loading posters in batches in the background
          console.log('Initial movies loaded, fetching posters in batches...');
          const moviesWithPosters = await updatePostersInBatches(initialMovies);
          
          // Update with posters once they're loaded
          setMovies(moviesWithPosters);
          setFilteredMovies(moviesWithPosters);
          console.log(`Final initial display: ${moviesWithPosters.length} movies with posters`);
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
        setInitialLoading(false);
        setLoading(false);
      }
    };
    
    fetchInitialMovies();
  }, []);

  // Load more movies when user clicks "Load More"
  const loadMoreMovies = async (recursionDepth: number = 0): Promise<void> => {
    // Limit recursion to prevent infinite loops
    const MAX_RECURSION_DEPTH = 3;
    if (recursionDepth > MAX_RECURSION_DEPTH) {
      console.log(`Reached maximum recursion depth (${MAX_RECURSION_DEPTH}), stopping`);
      setLoadingMore(false);
      return;
    }

    if (!hasMorePages || loadingMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      console.log(`Loading page ${nextPage} of movies (recursion: ${recursionDepth})`);
      
      const response = await moviesApi.getMoviesPaged(nextPage, pageSize);
      
      // Update pagination info
      setCurrentPage(response.pagination.currentPage);
      setTotalPages(response.pagination.totalPages);
      setHasMorePages(response.pagination.hasNext);
      
      if (response.movies.length > 0) {
        // Convert backend data to frontend format
        const newMoviesWithoutPosters = await Promise.all(response.movies.map(convertToMovie));
        
        // Add new movies to existing movies, preventing duplicates
        const allMovieIds = new Set(movies.map(m => m.id));
        const uniqueNewMovies = newMoviesWithoutPosters.filter(m => !allMovieIds.has(m.id));
        
        // If we didn't get any unique movies, try loading the next page (with recursion limit)
        if (uniqueNewMovies.length === 0 && hasMorePages && recursionDepth < MAX_RECURSION_DEPTH) {
          console.log('No new unique movies found on this page, trying next page');
          setLoadingMore(false);
          return loadMoreMovies(recursionDepth + 1); // Recursively try the next page with incremented depth
        }
        
        if (uniqueNewMovies.length === 0) {
          console.log('No more unique movies available');
          setHasMorePages(false);
          setLoadingMore(false);
          return;
        }
        
        // Then start loading posters for new movies in batches in the background
        console.log('Additional movies loaded, fetching posters in batches...');
        const newMoviesWithPosters = await updatePostersInBatches(uniqueNewMovies);
        
        // Correctly update movies by preserving existing and adding new with posters
        const moviesWithIdMap = new Map(movies.map(m => [m.id, m]));
        newMoviesWithPosters.forEach(newMovie => {
          moviesWithIdMap.set(newMovie.id, newMovie);
        });
        
        // Create final updated list using Array.from instead of spread operator
        const finalMoviesList = Array.from(moviesWithIdMap.values());
        
        // Update movies state directly, don't rely on useEffect to trigger filtering
        setMovies(prev => {
          // Use setTimeout to ensure this state update finishes before filtering happens
          setTimeout(() => {
            applyFilters(finalMoviesList);
          }, 0);
          return finalMoviesList;
        });
        
        // REMOVED: Don't call applyFilters here - will be called in the setTimeout above
      } else {
        // No more movies available
        setHasMorePages(false);
      }
    } catch (err) {
      console.error(`Error loading more movies (page ${currentPage + 1}):`, err);
      setError(`Error loading more movies. Please try again.`);
    } finally {
      setLoadingMore(false);
    }
  };
  
  // Helper function to apply all current filters to the movies list - make it synchronous
  const applyFilters = (moviesList: Movie[]) => {
    // Prevent concurrent filtering
    if (isFilteringRef.current) {
      console.log('Filtering already in progress, skipping');
      return;
    }
    
    isFilteringRef.current = true;
    
    try {
      // First deduplicate the movie list based on movie ID
      const uniqueMovies = removeDuplicateMovies(moviesList);
      
      let result = uniqueMovies;
    
    if (searchTerm) {
      result = result.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedGenre !== 'All Genres') {
        // Make a debug log to show what we're filtering for
        console.log(`Filtering for genre: "${selectedGenre}"`);
        
        // More robust genre matching with case insensitivity
        result = result.filter(movie => {
          const matchFound = movie.genres.some(genre => 
            genre.toLowerCase() === selectedGenre.toLowerCase()
          );
          return matchFound;
        });
        
        // Additional validation log
        if (result.length === 0) {
          console.warn(`No movies found for genre "${selectedGenre}". Available genres:`, 
            Array.from(new Set(uniqueMovies.flatMap(m => m.genres))).sort());
        } else {
          console.log(`Found ${result.length} movies for genre "${selectedGenre}"`);
        }
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
    } finally {
      isFilteringRef.current = false;
    }
  };

  // New function to remove duplicate movies based on ID
  const removeDuplicateMovies = (moviesList: Movie[]): Movie[] => {
    const uniqueMovies = new Map<string, Movie>();
    
    // Keep only the first occurrence of each movie ID
    moviesList.forEach(movie => {
      if (!uniqueMovies.has(movie.id)) {
        uniqueMovies.set(movie.id, movie);
      }
    });
    
    return Array.from(uniqueMovies.values());
  };

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

  // Fix the Filter movies useEffect to load more content when filters are applied
  useEffect(() => {
    // Don't filter if filtering is already in progress
    if (isFilteringRef.current) return;
    
    console.log('Filter settings changed, applying filters');
    
    // First apply filters to what we have
    applyFilters(movies);
    
    // Then check if we need to load more to fill the page
    const checkAndLoadMoreForFilter = async () => {
      // Get current filtered movies after the filter has been applied
      if (filteredMovies.length < 12 && hasMorePages && !loadingMore && !loadingFilterResults) {
        setLoadingFilterResults(true);
        try {
          await loadMoreForFilter();
        } finally {
          setLoadingFilterResults(false);
        }
      }
    };
    
    // Small delay to ensure the filteredMovies state is updated
    setTimeout(checkAndLoadMoreForFilter, 100);
    
  }, [searchTerm, selectedGenre, selectedContentType, collectionFilter, isAuthenticated, favorites, watchlist]);

  // Modify the loadMoreForFilter function to keep loading until we have enough filtered results
  const loadMoreForFilter = async (): Promise<void> => {
    if (!hasMorePages || loadingMore) return;
    
    try {
      console.log("Loading more content to fill filtered results");
      setLoadingMore(true);
      
      // Keep track of the initial state
      const initialFilteredCount = filteredMovies.length;
      let attemptedPages = 0;
      let totalLoaded = 0;
      const MAX_PAGES_TO_TRY = 6;
      
      // Keep loading pages until we have enough filtered results or reach our limit
      while (filteredMovies.length < initialFilteredCount + 12 && attemptedPages < MAX_PAGES_TO_TRY && hasMorePages) {
        attemptedPages++;
        const nextPage = currentPage + attemptedPages;
        console.log(`Loading page ${nextPage} to fill filtered results (attempt ${attemptedPages})`);
        
        const response = await moviesApi.getMoviesPaged(nextPage, pageSize);
        
        // Update pagination info
        setCurrentPage(response.pagination.currentPage);
        setTotalPages(response.pagination.totalPages);
        setHasMorePages(response.pagination.hasNext);
        
        if (response.movies.length === 0) {
          setHasMorePages(false);
          break;
        }
        
        // Convert and filter dupes
        const newMoviesWithoutPosters = await Promise.all(response.movies.map(convertToMovie));
        const allMovieIds = new Set(movies.map(m => m.id));
        const uniqueNewMovies = newMoviesWithoutPosters.filter(m => !allMovieIds.has(m.id));
        
        if (uniqueNewMovies.length === 0) continue;
        
        // Load posters
        const newMoviesWithPosters = await updatePostersInBatches(uniqueNewMovies);
        totalLoaded += uniqueNewMovies.length;
        
        // Apply current filter criteria to just the new movies to see if they match
        let matchingNewMovies = filterMoviesWithCriteria(newMoviesWithPosters);
        
        // If we got a decent number of matching movies, or we've tried enough pages, update the state
        if (matchingNewMovies.length > 0 || attemptedPages >= 3) {
          // Update the full movie list
          setMovies(prevMovies => {
            const updatedMovies = [...prevMovies, ...newMoviesWithPosters];
            // Apply filters after state update
            setTimeout(() => applyFilters(updatedMovies), 0);
            return updatedMovies;
          });
          
          // Wait a moment for state to update before checking if we need more
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      console.log(`Filter load complete: Added ${totalLoaded} total movies, filtered count now ${filteredMovies.length} (from initial ${initialFilteredCount})`);
      
    } catch (err) {
      console.error(`Error loading more movies for filter:`, err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Add a helper function to apply filter criteria without changing state
  const filterMoviesWithCriteria = (moviesToFilter: Movie[]): Movie[] => {
    let result = moviesToFilter;
    
    if (searchTerm) {
      result = result.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedGenre !== 'All Genres') {
      // More robust genre matching with case insensitivity and logging for debugging
      result = result.filter(movie => {
        const matchFound = movie.genres.some(genre => 
          genre.toLowerCase() === selectedGenre.toLowerCase()
        );
        
        // Debug logging for genre mismatches (comment out in production)
        if (!matchFound && Math.random() < 0.1) { // Only log 10% of mismatches to avoid console spam
          console.log(`Genre mismatch - Movie: "${movie.title}" has genres [${movie.genres.join(', ')}] but looking for "${selectedGenre}"`);
        }
        
        return matchFound;
      });
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
    
    return result;
  };

  // Update loadBatchForFilter to use the same approach
  const loadBatchForFilter = async () => {
    if (!hasMorePages || loadingMore) return;
    
    try {
      setLoadingMore(true);
      
      // Keep track of the initial state
      const initialFilteredCount = filteredMovies.length;
      let attemptedPages = 0;
      let totalLoaded = 0;
      const MAX_PAGES_TO_TRY = 8;
      
      // Keep loading pages until we have enough filtered results or reach our limit
      while (filteredMovies.length < initialFilteredCount + 12 && attemptedPages < MAX_PAGES_TO_TRY && hasMorePages) {
        attemptedPages++;
        const nextPage = currentPage + attemptedPages;
        console.log(`Load More - Loading page ${nextPage} (attempt ${attemptedPages})`);
        
        const response = await moviesApi.getMoviesPaged(nextPage, pageSize);
        
        // Update pagination info
        setCurrentPage(response.pagination.currentPage);
        setTotalPages(response.pagination.totalPages);
        setHasMorePages(response.pagination.hasNext);
        
        if (response.movies.length === 0) {
          setHasMorePages(false);
          break;
        }
        
        // Convert and filter dupes
        const newMoviesWithoutPosters = await Promise.all(response.movies.map(convertToMovie));
        const allMovieIds = new Set(movies.map(m => m.id));
        const uniqueNewMovies = newMoviesWithoutPosters.filter(m => !allMovieIds.has(m.id));
        
        if (uniqueNewMovies.length === 0) continue;
        
        // Load posters
        const newMoviesWithPosters = await updatePostersInBatches(uniqueNewMovies);
        totalLoaded += uniqueNewMovies.length;
        
        // Apply current filter criteria to just the new movies to see if they match
        let matchingNewMovies = filterMoviesWithCriteria(newMoviesWithPosters);
        console.log(`Found ${matchingNewMovies.length} matching movies out of ${newMoviesWithPosters.length} loaded`);
        
        // If we got a decent number of matching movies, or we've tried enough pages, update the state
        if (matchingNewMovies.length > 0 || attemptedPages >= 3) {
          // Update the full movie list
          setMovies(prevMovies => {
            const updatedMovies = [...prevMovies, ...newMoviesWithPosters];
            // Apply filters after state update
            setTimeout(() => applyFilters(updatedMovies), 0);
            return updatedMovies;
          });
          
          // Wait a moment for state to update before checking if we need more
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      console.log(`Load more complete: Added ${totalLoaded} total movies, filtered count now ${filteredMovies.length} (from initial ${initialFilteredCount})`);
      
    } catch (err) {
      console.error(`Error loading batch for filter:`, err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Update the handle load more to use the simplified function
  const handleLoadMore = () => {
    loadBatchForFilter();
  };

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
      
      {initialLoading ? (
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
            {filteredMovies.map(movie => (
              <div key={movie.id} className="movie-card">
                <Link to={`/movies/${movie.id}`}>
                  <div className="movie-card-inner">
                    <img src={movie.poster} alt={movie.title} />
                    <div className="movie-info">
                      <h3>{movie.title}</h3>
                      <div className="movie-card-footer">
                        <span className="movie-year">{movie.year}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          
          {hasMorePages && (
            <div className="load-more">
              <button 
                onClick={handleLoadMore} 
                className={`btn-primary ${loadingMore ? 'loading' : ''}`}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load More'}
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