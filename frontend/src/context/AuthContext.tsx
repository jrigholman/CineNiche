import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { usersApi, MovieUser, favoritesApi, watchlistApi, moviesApi } from '../services/api';

// Define user type
export interface User {
  id: number;
  name: string;
  email: string;
  initials: string;
  isAdmin?: boolean;
  phone?: string;
  age?: number;
  gender?: string;
  city?: string;
  state?: string;
}

// Define reviewed movie type
export interface ReviewedMovie {
  id: string;
  title: string;
  imageUrl: string;
  genre: string;
  year: number;
  rating: number; // 1-5 stars
  review: string;
}

// Define movie type for favorites and watchlist
export interface MovieItem {
  id: string;
  title: string;
  imageUrl: string;
  genre: string;
  year: number;
}

// Define authentication context type
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  reviewedMovies: ReviewedMovie[];
  favorites: MovieItem[];
  watchlist: MovieItem[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addReview: (review: ReviewedMovie) => void;
  toggleFavorite: (movie: MovieItem) => Promise<void>;
  toggleWatchlist: (movie: MovieItem) => Promise<void>;
  isInFavorites: (movieId: string) => boolean;
  isInWatchlist: (movieId: string) => boolean;
  isAdmin: boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  reviewedMovies: [],
  favorites: [],
  watchlist: [],
  login: async () => false,
  logout: () => {},
  addReview: () => {},
  toggleFavorite: async () => {},
  toggleWatchlist: async () => {},
  isInFavorites: () => false,
  isInWatchlist: () => false,
  isAdmin: false,
});

// Sample reviewed movies
const sampleReviewedMovies: ReviewedMovie[] = [
  { 
    id: '1', 
    title: 'The Seventh Seal', 
    imageUrl: 'https://via.placeholder.com/300x450?text=Movie+1', 
    genre: 'Drama', 
    year: 1957,
    rating: 5,
    review: 'A timeless masterpiece that explores the meaning of life and death through a medieval knight\'s chess game with Death itself.'
  },
  {
    id: '4', 
    title: 'Stalker', 
    imageUrl: 'https://via.placeholder.com/300x450?text=Movie+4', 
    genre: 'Sci-Fi', 
    year: 1979,
    rating: 4,
    review: 'A hypnotic journey through a mysterious forbidden zone. Tarkovsky\'s masterful direction creates an unforgettable atmosphere of dread and wonder.'
  }
];

// Helper to convert API data to MovieItem
const convertToMovieItem = async (movieId: string): Promise<MovieItem | null> => {
  try {
    const movieData = await moviesApi.getMovieById(movieId);
    if (movieData) {
      return {
        id: movieData.show_id,
        title: movieData.title || 'Untitled',
        imageUrl: `https://via.placeholder.com/300x450?text=${encodeURIComponent(movieData.title || 'Movie')}`,
        genre: 'Drama', // Default genre since backend doesn't have this yet
        year: movieData.release_year || 0
      };
    }
    return null;
  } catch (error) {
    console.error(`Error converting movie ${movieId} to MovieItem:`, error);
    return null;
  }
};

// Define provider component
export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [reviewedMovies, setReviewedMovies] = useState<ReviewedMovie[]>([]);
  const [favorites, setFavorites] = useState<MovieItem[]>([]);
  const [watchlist, setWatchlist] = useState<MovieItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check for saved auth state on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setIsAdmin(parsedUser.isAdmin || false);
        
        // Load user's favorites and watchlist from the database
        if (parsedUser.id) {
          loadUserFavorites(parsedUser.id);
          loadUserWatchlist(parsedUser.id);
        }
      } catch (e) {
        console.error('Error parsing saved user', e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Load user's favorites from the API
  const loadUserFavorites = async (userId: number) => {
    try {
      const userFavorites = await favoritesApi.getUserFavorites(userId);
      if (userFavorites.length > 0) {
        const favoriteItems: MovieItem[] = [];
        
        // Convert each favorite to a MovieItem
        for (const favorite of userFavorites) {
          const movieItem = await convertToMovieItem(favorite.movie_id);
          if (movieItem) {
            favoriteItems.push(movieItem);
          }
        }
        
        setFavorites(favoriteItems);
      }
    } catch (error) {
      console.error('Error loading user favorites:', error);
    }
  };
  
  // Load user's watchlist from the API
  const loadUserWatchlist = async (userId: number) => {
    try {
      const userWatchlist = await watchlistApi.getUserWatchlist(userId);
      if (userWatchlist.length > 0) {
        const watchlistItems: MovieItem[] = [];
        
        // Convert each watchlist item to a MovieItem
        for (const item of userWatchlist) {
          const movieItem = await convertToMovieItem(item.movie_id);
          if (movieItem) {
            watchlistItems.push(movieItem);
          }
        }
        
        setWatchlist(watchlistItems);
      }
    } catch (error) {
      console.error('Error loading user watchlist:', error);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Call the API to authenticate
      const userData = await usersApi.login(email, password);
      
      if (userData) {
        // Convert the backend user model to our frontend user model
        const userModel: User = {
          id: userData.user_id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          age: userData.age,
          gender: userData.gender,
          city: userData.city,
          state: userData.state,
          // Create initials from name
          initials: userData.name.split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase(),
          // Use the isAdmin flag from the database
          isAdmin: userData.isAdmin === 1
        };
        
        setUser(userModel);
        setIsAuthenticated(true);
        setIsAdmin(userModel.isAdmin || false);
        
        // Save user in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(userModel));
        
        // Load the user's favorites and watchlist
        await loadUserFavorites(userModel.id);
        await loadUserWatchlist(userModel.id);
        
        // For demo purposes, use sample data for reviews
        setReviewedMovies(sampleReviewedMovies);
        
        console.log('User logged in:', email);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setReviewedMovies([]);
    setFavorites([]);
    setWatchlist([]);
    setIsAdmin(false);
    
    // Clear saved auth state
    localStorage.removeItem('user');
    
    console.log('User logged out');
  };

  // Add review function
  const addReview = (review: ReviewedMovie) => {
    // Check if movie is already reviewed
    const existingIndex = reviewedMovies.findIndex(m => m.id === review.id);
    
    if (existingIndex !== -1) {
      // Update existing review
      const updatedReviews = [...reviewedMovies];
      updatedReviews[existingIndex] = review;
      setReviewedMovies(updatedReviews);
    } else {
      // Add new review
      setReviewedMovies([...reviewedMovies, review]);
    }
  };

  // Toggle favorite function
  const toggleFavorite = async (movie: MovieItem) => {
    if (!user) return;
    
    const existingIndex = favorites.findIndex(m => m.id === movie.id);
    
    if (existingIndex !== -1) {
      // Remove from favorites
      const result = await favoritesApi.removeFavorite(user.id, movie.id);
      
      if (result) {
        const updatedFavorites = favorites.filter(m => m.id !== movie.id);
        setFavorites(updatedFavorites);
      }
    } else {
      // Add to favorites
      const result = await favoritesApi.addFavorite(user.id, movie.id);
      
      if (result) {
        setFavorites([...favorites, movie]);
      }
    }
  };

  // Toggle watchlist function
  const toggleWatchlist = async (movie: MovieItem) => {
    if (!user) return;
    
    const existingIndex = watchlist.findIndex(m => m.id === movie.id);
    
    if (existingIndex !== -1) {
      // Remove from watchlist
      const result = await watchlistApi.removeFromWatchlist(user.id, movie.id);
      
      if (result) {
        const updatedWatchlist = watchlist.filter(m => m.id !== movie.id);
        setWatchlist(updatedWatchlist);
      }
    } else {
      // Add to watchlist
      const result = await watchlistApi.addToWatchlist(user.id, movie.id);
      
      if (result) {
        setWatchlist([...watchlist, movie]);
      }
    }
  };

  // Check if movie is in favorites
  const isInFavorites = (movieId: string): boolean => {
    return favorites.some(m => m.id === movieId);
  };

  // Check if movie is in watchlist
  const isInWatchlist = (movieId: string): boolean => {
    return watchlist.some(m => m.id === movieId);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      reviewedMovies, 
      favorites,
      watchlist,
      login, 
      logout, 
      addReview,
      toggleFavorite,
      toggleWatchlist,
      isInFavorites,
      isInWatchlist,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a hook for easy context use
export const useAuth = () => useContext(AuthContext); 