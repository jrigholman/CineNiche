import axios from 'axios';

// Create an axios instance with the base URL for our API
const api = axios.create({
  baseURL: 'http://localhost:5212/api', // Updated to match the running backend port
  headers: {
    'Content-Type': 'application/json',
  },
});

// Movie interfaces matching the backend DTOs
export interface MovieTitle {
  show_id: string;
  title: string;
  director: string;
  release_year: number;
  rating: string;
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

// API functions for movies
export const moviesApi = {
  // Get all movie titles
  getAllMovies: async (): Promise<MovieTitle[]> => {
    try {
      const response = await api.get('/movies/titles');
      return response.data;
    } catch (error) {
      console.error('Error fetching movies:', error);
      return [];
    }
  },

  // Get a single movie by ID
  getMovieById: async (id: string): Promise<MovieTitle | null> => {
    try {
      const response = await api.get(`/movies/titles/${id}`);
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
      // In a real app, we would send credentials to the backend
      // For now, we'll just get the users and find the matching one
      const users = await usersApi.getAllUsers();
      const user = users.find(u => u.email === email);
      
      // In a real app, password would be verified by the backend
      return user || null;
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

export default api; 