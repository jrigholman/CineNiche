import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Star Rating component
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span 
          key={star} 
          className={`star ${star <= rating ? 'filled' : ''}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const MyReviewsPage: React.FC = () => {
  const { isAuthenticated, reviewedMovies } = useAuth();
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="my-reviews-page">
      <div className="container">
        <h1>My Reviews</h1>
        
        {reviewedMovies.length === 0 ? (
          <div className="no-reviews">
            <p>You haven't reviewed any movies yet.</p>
            <Link to="/movies" className="btn-primary">Browse Movies</Link>
          </div>
        ) : (
          <div className="reviews-grid">
            {reviewedMovies.map(movie => (
              <div key={movie.id} className="review-card">
                <Link to={`/movies/${movie.id}`}>
                  <div className="review-card-inner">
                    <div className="review-movie-poster">
                      <img src={movie.imageUrl} alt={movie.title} />
                    </div>
                    <div className="review-content">
                      <h3>{movie.title}</h3>
                      <div className="review-meta">
                        <span className="review-year">{movie.year}</span>
                        <span className="review-genre">{movie.genre}</span>
                      </div>
                      <StarRating rating={movie.rating} />
                      <p className="review-text">{movie.review.substring(0, 100)}...</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviewsPage; 