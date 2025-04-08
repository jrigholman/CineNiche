import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define user type
export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  isAdmin?: boolean;
}

// Define reviewed movie type
export interface ReviewedMovie {
  id: number;
  title: string;
  imageUrl: string;
  genre: string;
  year: number;
  rating: number; // 1-5 stars
  review: string;
}

// Define movie type for favorites and watchlist
export interface MovieItem {
  id: number;
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
  login: (email: string, password: string) => void;
  logout: () => void;
  addReview: (review: ReviewedMovie) => void;
  toggleFavorite: (movie: MovieItem) => void;
  toggleWatchlist: (movie: MovieItem) => void;
  isInFavorites: (movieId: number) => boolean;
  isInWatchlist: (movieId: number) => boolean;
  isAdmin: boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  reviewedMovies: [],
  favorites: [],
  watchlist: [],
  login: () => {},
  logout: () => {},
  addReview: () => {},
  toggleFavorite: () => {},
  toggleWatchlist: () => {},
  isInFavorites: () => false,
  isInWatchlist: () => false,
  isAdmin: false,
});

// Sample user data
const sampleUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  initials: 'JD',
  isAdmin: false,
};

// Sample admin user data
const adminUser: User = {
  id: '2',
  name: 'Admin User',
  email: 'admin@cineniche.com',
  initials: 'AD',
  isAdmin: true,
};

// Sample reviewed movies
const sampleReviewedMovies: ReviewedMovie[] = [
  { 
    id: 1, 
    title: 'The Seventh Seal', 
    imageUrl: 'https://via.placeholder.com/300x450?text=Movie+1', 
    genre: 'Drama', 
    year: 1957,
    rating: 5,
    review: 'A timeless masterpiece that explores the meaning of life and death through a medieval knight\'s chess game with Death itself.'
  },
  {
    id: 4, 
    title: 'Stalker', 
    imageUrl: 'https://via.placeholder.com/300x450?text=Movie+4', 
    genre: 'Sci-Fi', 
    year: 1979,
    rating: 4,
    review: 'A hypnotic journey through a mysterious forbidden zone. Tarkovsky\'s masterful direction creates an unforgettable atmosphere of dread and wonder.'
  }
];

// Sample favorites
const sampleFavorites: MovieItem[] = [
  { id: 2, title: 'Eraserhead', imageUrl: 'https://via.placeholder.com/300x450?text=Movie+2', genre: 'Experimental', year: 1977 },
];

// Define provider component
export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [reviewedMovies, setReviewedMovies] = useState<ReviewedMovie[]>([]);
  const [favorites, setFavorites] = useState<MovieItem[]>([]);
  const [watchlist, setWatchlist] = useState<MovieItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Login function
  const login = (email: string, password: string) => {
    // In a real app, this would verify credentials with a backend
    // For now, we'll just set the authentication state
    setIsAuthenticated(true);
    
    // Check if this is the admin account
    if (email.toLowerCase() === adminUser.email.toLowerCase()) {
      setUser(adminUser);
      setIsAdmin(true);
    } else {
      setUser(sampleUser);
      setIsAdmin(false);
    }
    
    setReviewedMovies(sampleReviewedMovies);
    setFavorites(sampleFavorites);
    console.log('User logged in:', email);
  };

  // Logout function
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setReviewedMovies([]);
    setFavorites([]);
    setWatchlist([]);
    setIsAdmin(false);
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
  const toggleFavorite = (movie: MovieItem) => {
    const existingIndex = favorites.findIndex(m => m.id === movie.id);
    
    if (existingIndex !== -1) {
      // Remove from favorites
      const updatedFavorites = favorites.filter(m => m.id !== movie.id);
      setFavorites(updatedFavorites);
    } else {
      // Add to favorites
      setFavorites([...favorites, movie]);
    }
  };

  // Toggle watchlist function
  const toggleWatchlist = (movie: MovieItem) => {
    const existingIndex = watchlist.findIndex(m => m.id === movie.id);
    
    if (existingIndex !== -1) {
      // Remove from watchlist
      const updatedWatchlist = watchlist.filter(m => m.id !== movie.id);
      setWatchlist(updatedWatchlist);
    } else {
      // Add to watchlist
      setWatchlist([...watchlist, movie]);
    }
  };

  // Check if movie is in favorites
  const isInFavorites = (movieId: number): boolean => {
    return favorites.some(m => m.id === movieId);
  };

  // Check if movie is in watchlist
  const isInWatchlist = (movieId: number): boolean => {
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