import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Pause, Volume2, VolumeX, Settings, Maximize, SkipBack, SkipForward, ArrowLeft } from 'lucide-react';
import { moviesData } from './MovieDetailPage';

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

const WatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const videoContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // In a real app, this would be an API call
    setLoading(true);
    setTimeout(() => {
      const foundMovie = moviesData.find(m => m.id === Number(id));
      setMovie(foundMovie || null);
      setLoading(false);
      
      if (foundMovie) {
        // Set up fake duration based on movie runtime
        const totalMinutes = foundMovie.runtime;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        setDuration(`${hours}:${minutes < 10 ? '0' + minutes : minutes}:00`);
        setCurrentTime('0:00:00');
      }
    }, 500); // Simulate API delay
  }, [id]);
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    
    // If we start playing, simulate progress
    if (!isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 0.1;
          if (newProgress >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 100;
          }
          // Update current time
          const totalSeconds = movie ? movie.runtime * 60 * (newProgress / 100) : 0;
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = Math.floor(totalSeconds % 60);
          setCurrentTime(`${hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`);
          return newProgress;
        });
      }, 1000);
      
      // Clean up interval on component unmount
      return () => clearInterval(interval);
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setProgress(percentage);
    
    // Update current time based on percentage
    const totalSeconds = movie ? movie.runtime * 60 * (percentage / 100) : 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    setCurrentTime(`${hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`);
  };
  
  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      // Enter fullscreen
      videoContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
      });
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading movie player...</div>
      </div>
    );
  }
  
  if (!movie) {
    return (
      <div className="error-container">
        <h2>Movie Not Found</h2>
        <p>Sorry, we couldn't find the movie you're looking for.</p>
        <Link to="/movies" className="btn-primary">Back to Movies</Link>
      </div>
    );
  }
  
  return (
    <div className="watch-page">
      <div className="watch-container">
        <div className="watch-header">
          <div className="watch-info">
            <h2>{movie.title}</h2>
            <div className="watch-meta">
              <span className="watch-year">{movie.year}</span>
              <span className="watch-rating">{movie.contentRating}</span>
              <span className="watch-runtime">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
            </div>
          </div>
          <button 
            className="watch-back-button"
            onClick={() => navigate(`/movies/${movie.id}`)}
          >
            <ArrowLeft size={20} /> Back
          </button>
        </div>
        
        <div className="player-container">
          <div className="video-container" ref={videoContainerRef}>
            <img src={movie.imageUrl} alt={movie.title} className="video-poster" />
            
            {!isPlaying && (
              <div className="play-overlay" onClick={togglePlay}>
                <div className="play-button">
                  <Play size={48} />
                </div>
              </div>
            )}
            
            <div className={`movie-title-overlay ${isPlaying ? 'fade' : ''}`}>
              <h1>{movie.title} ({movie.year})</h1>
            </div>
            
            <div className="player-controls">
              <div className="progress-container">
                <div 
                  className="progress-bar" 
                  onClick={handleProgressBarClick}
                >
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progress}%` }}
                  ></div>
                  <div 
                    className="progress-thumb" 
                    style={{ left: `${progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="controls-row">
                <div className="left-controls">
                  <button className="control-button" onClick={togglePlay}>
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <button className="control-button">
                    <SkipBack size={20} />
                  </button>
                  <button className="control-button">
                    <SkipForward size={20} />
                  </button>
                  <button className="control-button" onClick={toggleMute}>
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <div className="time-display">
                    <span>{currentTime} / {duration}</span>
                  </div>
                </div>
                
                <div className="right-controls">
                  <button className="control-button">
                    <Settings size={20} />
                  </button>
                  <button className="control-button" onClick={toggleFullscreen}>
                    <Maximize size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage; 