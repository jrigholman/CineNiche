import axios from 'axios';

// Create an axios instance with the base URL for our API
const api = axios.create({
  baseURL: 'https://cineniche-fkazataxamgph8bu.eastus-01.azurewebsites.net/api/movies', // Updated to match the running backend port
  headers: {
    'Content-Type': 'application/json',
  },
});

// Movie interfaces matching the backend DTOs
export interface MovieTitle {
  show_id: string;
  type?: string;
  title?: string;
  director?: string;
  cast?: string;
  country?: string;
  release_year?: number;
  rating?: string;
  duration?: string;
  description?: string;
  Categories?: string[];
  RuntimeMinutes?: number;
  categories?: string[];
  runtimeMinutes?: number;
}

export interface MovieRating {
  user_id: number;
  show_id: string;
  rating: number;
}

export interface MovieUser {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  city: string;
  state: string;
  password: string;
  isAdmin: number; // 0 for regular users, 1 for admins
}

export interface UserFavorite {
  favorite_id?: number; // Optional because it's auto-assigned by the database
  user_id: number;
  movie_id: string;
}

export interface UserWatchlist {
  watchlist_id?: number; // Optional because it's auto-assigned by the database
  user_id: number;
  movie_id: string;
}

// Poster URL cache to reduce API calls
let posterCache: Record<string, string> = {};
// Flag to track if we've loaded all posters already
let allPostersLoaded = false;
// Store all posters once fetched
let allPosterUrls: string[] = [];

// API response interfaces for pagination
export interface PaginatedResponse<T> {
  movies: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// API functions for movies
export const moviesApi = {
  // Get all movie titles (old method, kept for backward compatibility)
  getAllMovies: async (): Promise<MovieTitle[]> => {
    try {
      console.warn('getAllMovies() is deprecated, please use getMoviesPaged() instead');
      const response = await api.get('/movies/titles');
      return response.data;
    } catch (error) {
      console.error('Error fetching movies:', error);
      return [];
    }
  },
  
  getMovieRecommendations: async (showId: string, userId?: number): Promise<MovieTitle[]> => {
    try {
        const params = userId ? `?userId=${userId}` : '';
        const response = await api.get(`/movies/titles/${showId}/recommendations${params}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching recommendations for movie ${showId}:`, error);
        return [];
    }
  },

  // Get movie titles with pagination
  getMoviesPaged: async (page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<MovieTitle>> => {
    try {
      // Pre-fetch all posters to avoid individual requests later
      if (!allPostersLoaded) {
        try {
          const postersResponse = await api.get('/posters');
          if (Array.isArray(postersResponse.data) && postersResponse.data.length > 0) {
            allPosterUrls = postersResponse.data;
            allPostersLoaded = true;
            console.log(`Pre-fetched ${allPosterUrls.length} poster URLs`);
          }
        } catch (error) {
          console.error('Error pre-fetching posters:', error);
        }
      }
      
      try {
        // First try the paginated endpoint
        const response = await api.get<PaginatedResponse<MovieTitle>>('/movies/titles/paged', {
          params: { page, pageSize }
        });
        
        console.log(`Fetched page ${page} of movies (${response.data.movies.length} items)`);
        return response.data;
      } catch (pagedError) {
        // If the paged endpoint fails, fall back to the non-paginated endpoint
        console.warn('Paged endpoint failed, falling back to non-paginated endpoint:', pagedError);
        
        const allMoviesResponse = await api.get<MovieTitle[]>('/movies/titles');
        const allMovies = allMoviesResponse.data;
        
        // Manually paginate the results
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedMovies = allMovies.slice(startIndex, endIndex);
        
        // Create a response object that matches the expected format
        return {
          movies: paginatedMovies,
          pagination: {
            currentPage: page,
            pageSize: pageSize,
            totalPages: Math.ceil(allMovies.length / pageSize),
            totalCount: allMovies.length,
            hasNext: endIndex < allMovies.length,
            hasPrevious: page > 1
          }
        };
      }
    } catch (error) {
      console.error(`Error fetching movies page ${page}:`, error);
      return {
        movies: [],
        pagination: {
          currentPage: page,
          pageSize: pageSize,
          totalPages: 0,
          totalCount: 0,
          hasNext: false,
          hasPrevious: page > 1
        }
      };
    }
  },

  // Get a single movie by ID
  getMovieById: async (id: string): Promise<MovieTitle | null> => {
    try {
      console.log(`Fetching movie with ID: ${id}`);
      const response = await api.get(`/movies/titles/${id}`);
      console.log(`Raw API response for movie ${id}:`, response.data);
      console.log(`Response contains Categories:`, response.data.Categories);
      console.log(`Response contains RuntimeMinutes:`, response.data.RuntimeMinutes);
      return response.data;
    } catch (error) {
      console.error(`Error fetching movie with ID ${id}:`, error);
      return null;
    }
  },

  // Get ratings for a specific movie
  getMovieRatings: async (id: string): Promise<MovieRating[]> => {
    try {
      const response = await api.get(`/movies/ratings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ratings for movie with ID ${id}:`, error);
      return [];
    }
  },

  // Get average rating for a specific movie
  getMovieAverageRating: async (id: string): Promise<number> => {
    try {
      const response = await api.get(`/movies/ratings/average/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error calculating average rating for movie with ID ${id}:`, error);
      return 0;
    }
  },
  
  // Get movie poster URL - optimized with caching
  getMoviePosterUrl: async (title: string): Promise<string> => {
    if (!title) {
      console.warn('Empty title provided to getMoviePosterUrl');
      return `/images/placeholder-movie.jpg`;
    }

    // Check cache first
    if (posterCache[title]) {
      return posterCache[title];
    }

    // Pre-fetch all posters if we haven't already
    if (!allPostersLoaded || allPosterUrls.length === 0) {
      try {
        console.log(`Fetching all posters for title: "${title}"`);
        const postersResponse = await api.get('/posters');
        if (Array.isArray(postersResponse.data) && postersResponse.data.length > 0) {
          allPosterUrls = postersResponse.data;
          allPostersLoaded = true;
          console.log(`Fetched ${allPosterUrls.length} poster URLs`);
        }
      } catch (error) {
        console.error('Error fetching all posters:', error);
      }
    }

    // If we have posters, use our sophisticated matching algorithm
    if (allPostersLoaded && allPosterUrls.length > 0) {
      const bestMatch = findBestPosterMatch(title, allPosterUrls);
      posterCache[title] = bestMatch;
      return bestMatch;
    }

    // Fallback: direct API request for this specific title
    try {
      const response = await api.get(`/posters/${encodeURIComponent(title)}`);
      
      if (response.data && typeof response.data === 'object' && 'url' in response.data) {
        const posterUrl = response.data.url;
        posterCache[title] = posterUrl;
        return posterUrl;
      } else if (Array.isArray(response.data) && response.data.length > 0) {
        // If we got an array back, use our matching algorithm
        const bestMatch = findBestPosterMatch(title, response.data);
        posterCache[title] = bestMatch;
        return bestMatch;
      }
      
      return `/images/placeholder-movie.jpg`;
    } catch (error) {
      console.error(`Error fetching poster for movie "${title}":`, error);
      return `/images/placeholder-movie.jpg`;
    }
  }
};

// Helper function to find the best poster match
function findBestPosterMatch(title: string, posters: string[]): string {
  if (!posters.length) return `/images/placeholder-movie.jpg`;
  
  console.log(`===== Finding match for title: "${title}" =====`);
  
  // For exact boundary checking (to prevent partial matches)
  const exactBoundaryMatch = (url: string, searchTerm: string) => {
    const urlLower = url.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    // Check if the search term is surrounded by non-word characters or is at the start/end
    const fileNameOnly = urlLower.split('/').pop() || '';
    return (
      // Match patterns like "/exact-title." or "/exact-title/"
      urlLower.includes(`/${searchLower}.`) || 
      urlLower.includes(`/${searchLower}/`) ||
      // Or match exact file name (accounting for extension)
      fileNameOnly === searchLower || 
      fileNameOnly.startsWith(`${searchLower}.`) ||
      // Or movie posters directory structure
      urlLower.includes(`movie posters/${searchLower}.`) ||
      urlLower.includes(`movie posters/${searchLower}/`)
    );
  };
  
  // Special case for apostrophe-starting titles
  if (title.startsWith("'")) {
    const titleWithoutApostrophe = title.substring(1);
    // First try to find exact matches with the apostrophe
    const exactApostropheMatch = posters.find(url => exactBoundaryMatch(url, title));
    if (exactApostropheMatch) {
      console.log(`Found exact match with apostrophe for "${title}": ${exactApostropheMatch}`);
      return exactApostropheMatch;
    }
    
    // Then try without the apostrophe
    const apostropheMatch = posters.find(url => exactBoundaryMatch(url, titleWithoutApostrophe));
    if (apostropheMatch) {
      console.log(`Found match without apostrophe for "${title}": ${apostropheMatch}`);
      return apostropheMatch;
    }
    
    // Finally try with just file name inclusion (non-boundary)
    const looseApostropheMatch = posters.find(url => 
      url.toLowerCase().includes(title.toLowerCase()) ||
      url.toLowerCase().includes(titleWithoutApostrophe.toLowerCase())
    );
    if (looseApostropheMatch) {
      console.log(`Found loose match for apostrophe title "${title}": ${looseApostropheMatch}`);
      return looseApostropheMatch;
    }
  }
  
  // Handle titles with leading # (common in some databases)
  let titleWithHash = title;
  let titleWithoutHash = title;
  if (title.startsWith('#')) {
    titleWithoutHash = title.substring(1);
  } else {
    titleWithHash = '#' + title;
  }
  
  // 1. Try exact boundary matches first for the original title
  const exactMatch = posters.find(url => exactBoundaryMatch(url, title));
  if (exactMatch) {
    console.log(`Found exact boundary match for "${title}": ${exactMatch}`);
    return exactMatch;
  }
  
  // 2. Try with hash variants for exact boundary matches
  const hashMatch = posters.find(url => 
    exactBoundaryMatch(url, titleWithoutHash) || 
    exactBoundaryMatch(url, titleWithHash)
  );
  if (hashMatch) {
    console.log(`Found exact hash variant match: ${hashMatch}`);
    return hashMatch;
  }
  
  // 3. Special case for sequels
  // Check if this looks like a sequel (ends with a number or roman numeral)
  const isSequel = /[\s\:]+([\d]+|II|III|IV|V|VI|VII|VIII|IX|X)$/i.test(title);
  
  if (isSequel) {
    // Extract the base name and sequel number
    const sequelMatch = title.match(/^(.+?)[\s\:]+(\d+|II|III|IV|V|VI|VII|VIII|IX|X)$/i);
    
    if (sequelMatch) {
      const baseTitle = sequelMatch[1].trim();
      const sequelNumber = sequelMatch[2];
      
      console.log(`Detected sequel: Base="${baseTitle}", Number="${sequelNumber}"`);
      
      // First try exact match with full title (highest priority)
      const exactFullTitleMatch = posters.find(url => 
        exactBoundaryMatch(url, title) ||
        // Also try with both # variants
        (title.startsWith('#') ? exactBoundaryMatch(url, titleWithoutHash) : exactBoundaryMatch(url, titleWithHash))
      );
      
      if (exactFullTitleMatch) {
        console.log(`Found exact match for full sequel title "${title}": ${exactFullTitleMatch}`);
        return exactFullTitleMatch;
      }
      
      // Next check for boundary matches that include both the base title and sequel number
      const sequelCompleteMatches = posters.filter(url => {
        const urlLower = url.toLowerCase();
        const fileNameOnly = urlLower.split('/').pop() || '';
        
        // Check if file name contains both components in the right order
        return fileNameOnly.includes(`${baseTitle.toLowerCase()} ${sequelNumber.toLowerCase()}`) ||
               fileNameOnly.includes(`${baseTitle.toLowerCase()}${sequelNumber.toLowerCase()}`);
      });
      
      if (sequelCompleteMatches.length > 0) {
        console.log(`Found boundary match for sequel "${title}": ${sequelCompleteMatches[0]}`);
        return sequelCompleteMatches[0];
      }
    }
  }
  
  // 4. For non-sequels, make sure we don't match sequels inadvertently
  if (!isSequel) {
    // Try to find exact non-sequel match
    const nonSequelMatches = posters.filter(url => {
      const urlLower = url.toLowerCase();
      const fileName = urlLower.split('/').pop() || '';
      const titleLower = title.toLowerCase();
      
      // Check for exact boundary match in file name
      if (fileName === titleLower || 
          fileName.startsWith(`${titleLower}.`)) {
        return true;
      }
      
      // Make sure no numbers or roman numerals follow the title
      const hasSequelIndicator = /[\s\:]+(\d+|ii|iii|iv|v|vi|vii|viii|ix|x)\b/i.test(fileName);
      
      return fileName.includes(titleLower) && !hasSequelIndicator;
    });
    
    if (nonSequelMatches.length > 0) {
      console.log(`Found non-sequel match for "${title}": ${nonSequelMatches[0]}`);
      return nonSequelMatches[0];
    }
  }
  
  // 5. Try with cleaned title (no special characters) with boundary checking
  const cleanTitle = title.replace(/[^\w\s]/gi, '').toLowerCase();
  const cleanMatch = posters.find(url => exactBoundaryMatch(url, cleanTitle));
  
  if (cleanMatch) {
    console.log(`Found clean boundary match for "${title}": ${cleanMatch}`);
    return cleanMatch;
  }
  
  // 6. Try looser matching if everything else fails
  // First try with basic inclusion
  const looseMatch = posters.find(url => 
    url.toLowerCase().includes(title.toLowerCase())
  );
  
  if (looseMatch) {
    console.log(`Found loose match for "${title}": ${looseMatch}`);
    return looseMatch;
  }
  
  // 7. Try partial word matching, prioritizing longer words
  const words = cleanTitle.split(/\s+/).filter(w => w.length > 2);
  const sortedWords = [...words].sort((a, b) => b.length - a.length);
  
  for (const word of sortedWords) {
    if (word.length < 3) continue;
    
    const partialMatch = posters.find(url => 
      url.toLowerCase().includes(word.toLowerCase())
    );
    
    if (partialMatch) {
      console.log(`Found word match "${word}" for "${title}": ${partialMatch}`);
      return partialMatch;
    }
  }
  
  // 8. Last resort - return the first poster
  console.log(`No match found for "${title}", returning first poster`);
  return posters[0];
}

// Debugging utility to find issues with poster matching
export const debugPosterMatching = async (title: string): Promise<void> => {
  console.log(`======== POSTER MATCHING DEBUG FOR: "${title}" ========`);
  
  try {
    // Get all posters
    if (!allPostersLoaded) {
      try {
        const postersResponse = await api.get('/posters');
        if (Array.isArray(postersResponse.data) && postersResponse.data.length > 0) {
          allPosterUrls = postersResponse.data;
          allPostersLoaded = true;
          console.log(`Loaded ${allPosterUrls.length} poster URLs for debugging`);
        }
      } catch (error) {
        console.error('Error loading posters for debugging:', error);
        return;
      }
    }
    
    // Extract potential matches
    const titleLower = title.toLowerCase();
    
    // Look for direct title match
    const exactMatches = allPosterUrls.filter(url => 
      url.toLowerCase().includes(titleLower)
    );
    
    console.log(`Direct matches for "${title}" (${exactMatches.length}):`);
    exactMatches.forEach(url => console.log(`  - ${url}`));
    
    // Try with hash variants
    let titleWithHash = title;
    let titleWithoutHash = title;
    if (title.startsWith('#')) {
      titleWithoutHash = title.substring(1);
    } else {
      titleWithHash = '#' + title;
    }
    
    const hashVariantMatches = allPosterUrls.filter(url => 
      url.toLowerCase().includes(titleWithHash.toLowerCase()) || 
      url.toLowerCase().includes(titleWithoutHash.toLowerCase())
    );
    
    if (hashVariantMatches.length > exactMatches.length) {
      console.log(`Hash variant matches for "${titleWithHash}" or "${titleWithoutHash}" (${hashVariantMatches.length}):`);
      hashVariantMatches
        .filter(url => !exactMatches.includes(url))
        .forEach(url => console.log(`  - ${url}`));
    }
    
    // Check if this is a sequel
    const sequelMatch = title.match(/^(.+?)[\s\:]+(\d+|II|III|IV|V|VI|VII|VIII|IX|X)$/i);
    if (sequelMatch) {
      const baseTitle = sequelMatch[1].trim();
      const sequelNumber = sequelMatch[2];
      
      console.log(`Sequel detected: Base="${baseTitle}", Number="${sequelNumber}"`);
      
      // Find posters with the base title (no sequel number)
      const baseTitleMatches = allPosterUrls.filter(url => 
        url.toLowerCase().includes(baseTitle.toLowerCase()) && 
        !url.toLowerCase().includes(sequelNumber.toLowerCase())
      );
      
      console.log(`Base title matches (without sequel number) for "${baseTitle}" (${baseTitleMatches.length}):`);
      baseTitleMatches.forEach(url => console.log(`  - ${url}`));
      
      // Find posters with both base title and sequel number
      const bothPartsMatches = allPosterUrls.filter(url => 
        url.toLowerCase().includes(baseTitle.toLowerCase()) && 
        url.toLowerCase().includes(sequelNumber.toLowerCase())
      );
      
      console.log(`Complete sequel matches for "${baseTitle}" and "${sequelNumber}" (${bothPartsMatches.length}):`);
      bothPartsMatches.forEach(url => console.log(`  - ${url}`));
    }
    
    // Finally, use our matching function to see what it would pick
    console.log(`\nBest match selected by algorithm:`, findBestPosterMatch(title, allPosterUrls));
    
  } catch (error) {
    console.error('Error during poster matching debug:', error);
  }
};

// API functions for users
export const usersApi = {
  // Get all users
  getAllUsers: async (): Promise<MovieUser[]> => {
    try {
      const response = await api.get('/movies/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // Get a user by ID
  getUserById: async (id: number): Promise<MovieUser | null> => {
    try {
      const response = await api.get(`/movies/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      return null;
    }
  },

  // Login (for demonstration, we'll assume backend will validate credentials)
  login: async (email: string, password: string): Promise<MovieUser | null> => {
    try {
      console.log(`Attempting login for email: ${email}`);
      
      // In a real app, we would send credentials to the backend
      // For now, we'll just get the users and find the matching one
      const users = await usersApi.getAllUsers();
      console.log(`Fetched ${users.length} users from database`);
      
      // Debug the available users (be careful with logging passwords in production)
      users.forEach((user, index) => {
        console.log(`User ${index+1}: email=${user.email}, name=${user.name}`);
      });
      
      // Find user with matching email
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        console.log(`No user found with email: ${email}`);
        return null;
      }
      
      console.log(`Found user: ${user.name} (${user.email})`);
      
      // Check if password matches - case sensitive
      if (user.password === password) {
        console.log('Password matched, login successful');
        return user;
      } else {
        console.log('Password did not match, login failed');
        return null;
      }
    } catch (error) {
      console.error('Error during login:', error);
      return null;
    }
  },

  // Get user reviews
  getUserReviews: async (userId: number): Promise<MovieRating[]> => {
    try {
      const response = await api.get(`/movies/ratings/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching reviews for user with ID ${userId}:`, error);
      return [];
    }
  },
};

// API functions for favorites
export const favoritesApi = {
  // Get favorites for a user
  getUserFavorites: async (userId: number): Promise<UserFavorite[]> => {
    try {
      const response = await api.get(`/movies/favorites/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching favorites for user with ID ${userId}:`, error);
      return [];
    }
  },

  // Add a movie to favorites
  addFavorite: async (userId: number, movieId: string): Promise<UserFavorite | null> => {
    try {
      const response = await api.post('/movies/favorites', {
        user_id: userId,
        movie_id: movieId
      });
      return response.data;
    } catch (error) {
      console.error(`Error adding movie ${movieId} to favorites for user ${userId}:`, error);
      return null;
    }
  },

  // Remove a movie from favorites
  removeFavorite: async (userId: number, movieId: string): Promise<boolean> => {
    try {
      await api.delete(`/movies/favorites/${userId}/${movieId}`);
      return true;
    } catch (error) {
      console.error(`Error removing movie ${movieId} from favorites for user ${userId}:`, error);
      return false;
    }
  }
};

// API functions for watchlist
export const watchlistApi = {
  // Get watchlist for a user
  getUserWatchlist: async (userId: number): Promise<UserWatchlist[]> => {
    try {
      const response = await api.get(`/movies/watchlist/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching watchlist for user with ID ${userId}:`, error);
      return [];
    }
  },

  // Add a movie to watchlist
  addToWatchlist: async (userId: number, movieId: string): Promise<UserWatchlist | null> => {
    try {
      const response = await api.post('/movies/watchlist', {
        user_id: userId,
        movie_id: movieId
      });
      return response.data;
    } catch (error) {
      console.error(`Error adding movie ${movieId} to watchlist for user ${userId}:`, error);
      return null;
    }
  },

  // Remove a movie from watchlist
  removeFromWatchlist: async (userId: number, movieId: string): Promise<boolean> => {
    try {
      await api.delete(`/movies/watchlist/${userId}/${movieId}`);
      return true;
    } catch (error) {
      console.error(`Error removing movie ${movieId} from watchlist for user ${userId}:`, error);
      return false;
    }
  }
};

// Function to force reload all posters (for debugging)
export const forceReloadPosters = async (): Promise<boolean> => {
  try {
    console.log("🔄 Forcing reload of all poster URLs...");
    allPostersLoaded = false;
    posterCache = {};
    
    const postersResponse = await api.get('/posters');
    if (Array.isArray(postersResponse.data) && postersResponse.data.length > 0) {
      allPosterUrls = postersResponse.data;
      allPostersLoaded = true;
      console.log(`✅ Successfully reloaded ${allPosterUrls.length} poster URLs`);
      return true;
    } else {
      console.error("❌ Received invalid data when reloading posters");
      return false;
    }
  } catch (error) {
    console.error("❌ Error reloading posters:", error);
    return false;
  }
};

export default api; 