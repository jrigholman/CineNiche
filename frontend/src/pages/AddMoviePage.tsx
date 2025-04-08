import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { moviesData } from './MovieDetailPage';

// Shared Movie interface definition
interface Movie {
  id: number;
  title: string;
  imageUrl: string;
  genre: string;
  year: number;
  director: string;
  cast: string[];
  country: string;
  description: string;
  contentRating: string;
  runtime: number;
  averageRating: number;
  ratingCount: number;
}

const AddMoviePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  // State for the new movie fields
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [director, setDirector] = useState('');
  const [castInput, setCastInput] = useState('');
  const [country, setCountry] = useState('');
  const [description, setDescription] = useState('');
  const [contentRating, setContentRating] = useState('');
  const [runtime, setRuntime] = useState(90);
  
  // If not admin, redirect
  if (!isAdmin) {
    navigate('/movies');
    return null;
  }
  
  const handleCastChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCastInput(e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate an ID that doesn't exist in the current data
    // In a real app, the backend would handle this
    const newId = Math.max(...moviesData.map(m => m.id)) + 1;
    
    // Create a new movie object
    const newMovie: Movie = {
      id: newId,
      title,
      imageUrl,
      genre,
      year,
      director,
      cast: castInput.split(',').map(item => item.trim()).filter(item => item),
      country,
      description,
      contentRating,
      runtime,
      averageRating: 0,
      ratingCount: 0
    };
    
    // In a real app, this would be an API call
    // For now, just add to our local data store
    moviesData.push(newMovie);
    
    // Redirect to the new movie's detail page
    navigate(`/movies/${newId}`);
  };
  
  return (
    <div className="movie-detail-page">
      <div className="container">
        <div className="movie-header">
          <Link to="/movies" className="back-button">Back to Movies</Link>
        </div>
        
        <div className="admin-edit-form">
          <h2>Add New Movie</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-columns">
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="imageUrl">Image URL</label>
                  <input
                    id="imageUrl"
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    required
                    placeholder="https://example.com/movie-poster.jpg"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="genre">Genre</label>
                    <input
                      id="genre"
                      type="text"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="year">Year</label>
                    <input
                      id="year"
                      type="number"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="director">Director</label>
                  <input
                    id="director"
                    type="text"
                    value={director}
                    onChange={(e) => setDirector(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="cast">Cast (comma separated)</label>
                  <input
                    id="cast"
                    type="text"
                    value={castInput}
                    onChange={handleCastChange}
                    required
                    placeholder="Actor 1, Actor 2, Actor 3"
                  />
                </div>
              </div>
              
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <input
                    id="country"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="contentRating">Content Rating</label>
                    <input
                      id="contentRating"
                      type="text"
                      value={contentRating}
                      onChange={(e) => setContentRating(e.target.value)}
                      required
                      placeholder="PG-13, R, etc."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="runtime">Runtime (minutes)</label>
                    <input
                      id="runtime"
                      type="number"
                      value={runtime}
                      onChange={(e) => setRuntime(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                
                {imageUrl && (
                  <div className="image-preview">
                    <label>Image Preview</label>
                    <img src={imageUrl} alt="Movie poster preview" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn-primary">Add Movie</button>
              <button
                type="button" 
                className="btn-secondary"
                onClick={() => navigate('/movies')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMoviePage; 