import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImage from '../cineniche-high-resolution2.png';

// Sample movie images for carousel
const movieImages = [
  { id: 1, src: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg", title: "The Matrix" },
  { id: 2, src: "https://m.media-amazon.com/images/M/MV5BMDdmZGU3NDQtY2E5My00ZTliLWIzOTUtMTY4ZGI1YjdiNjk3XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_.jpg", title: "Titanic" },
  { id: 3, src: "https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZWMtM2NhNS00NDJjLTk4NDItYTRmY2EwMWZlMTY3XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg", title: "The Lord of the Rings" },
  { id: 4, src: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg", title: "The Dark Knight" },
  { id: 6, src: "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg", title: "Forrest Gump" },
  { id: 8, src: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg", title: "Interstellar" }
];

// Sample recommended movies
const recommendedMovies = [
  { id: 10, src: "https://m.media-amazon.com/images/M/MV5BNWM1NmYyM2ItMTFhNy00NDU0LTk2ODItYWEyMzQ5MThmNzVhXkEyXkFqcGdeQXVyNTU1OTUzNDg@._V1_.jpg", title: "Eraserhead" },
  { id: 11, src: "https://m.media-amazon.com/images/M/MV5BNDg4NjM1YjMtYmNhZC00MjM0LWFiZmYtNGY1YjA3MzZmODc5XkEyXkFqcGdeQXVyNDk3NzU2MTQ@._V1_.jpg", title: "Brazil" },
  { id: 12, src: "https://m.media-amazon.com/images/M/MV5BNWZiMTFiZTgtN2I1OC00MDgxLWI2ZmQtNDFiYmQ5MzlhZDZlXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg", title: "Stalker" },
  { id: 13, src: "https://m.media-amazon.com/images/M/MV5BYzQzNTU3OTAtZmY4NS00NzJmLTg2M2UtMmQwNWY0MWRhOWZkXkEyXkFqcGdeQXVyMTY5Nzc4MDY@._V1_.jpg", title: "Holy Mountain" },
  { id: 14, src: "https://m.media-amazon.com/images/M/MV5BMjFkMTYwOGItMTBiYS00YjZiLWJkNGMtNjliZThjMWI0NWY3XkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg", title: "Mandy" },
  { id: 15, src: "https://m.media-amazon.com/images/M/MV5BMDE3ZmY0OGQtNWI4MS00OWI1LWJjOTUtZGIzYTJjNzkzYzM2XkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_.jpg", title: "Everything Everywhere All at Once" }
];

// Duplicate arrays to create a continuous scrolling effect
const extendedMovieImages = [...movieImages, ...movieImages, ...movieImages];
const extendedRecommendedMovies = [...recommendedMovies, ...recommendedMovies, ...recommendedMovies];

const HomePage: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const recommendedCarouselRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecommendedPaused, setIsRecommendedPaused] = useState(false);
  const [startX, setStartX] = useState<number | null>(null);
  const [startXRecommended, setStartXRecommended] = useState<number | null>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollLeftRecommended, setScrollLeftRecommended] = useState(0);
  
  // Get auth context
  const { isAuthenticated, user } = useAuth();
  
  // Auto-scroll effect for recent movies
  useEffect(() => {
    let animationId: number;
    let lastTimestamp = 0;
    
    const autoScroll = (timestamp: number) => {
      if (!isPaused && carouselRef.current) {
        // Calculate elapsed time since last frame
        const elapsed = timestamp - lastTimestamp;
        
        if (elapsed > 16) { // roughly 60fps
          // Slow scroll speed (0.5 pixels per frame)
          carouselRef.current.scrollLeft += 0.5;
          lastTimestamp = timestamp;
          
          // Reset scroll position when reaching the end for infinite scroll effect
          if (carouselRef.current.scrollLeft >= carouselRef.current.scrollWidth - carouselRef.current.clientWidth - 10) {
            carouselRef.current.scrollLeft = 0;
          }
        }
      }
      
      animationId = requestAnimationFrame(autoScroll);
    };
    
    animationId = requestAnimationFrame(autoScroll);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPaused]);
  
  // Auto-scroll effect for recommended movies
  useEffect(() => {
    if (!isAuthenticated) return;
    
    let animationId: number;
    let lastTimestamp = 0;
    
    const autoScroll = (timestamp: number) => {
      if (!isRecommendedPaused && recommendedCarouselRef.current) {
        // Calculate elapsed time since last frame
        const elapsed = timestamp - lastTimestamp;
        
        if (elapsed > 16) { // roughly 60fps
          // Slow scroll speed but in opposite direction
          recommendedCarouselRef.current.scrollLeft -= 0.5;
          lastTimestamp = timestamp;
          
          // Reset scroll position when reaching the start for infinite scroll effect
          if (recommendedCarouselRef.current.scrollLeft <= 0) {
            recommendedCarouselRef.current.scrollLeft = 
              recommendedCarouselRef.current.scrollWidth - recommendedCarouselRef.current.clientWidth;
          }
        }
      }
      
      animationId = requestAnimationFrame(autoScroll);
    };
    
    animationId = requestAnimationFrame(autoScroll);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isRecommendedPaused, isAuthenticated]);
  
  // Event handlers for recent movies carousel
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };
  
  const handleMouseLeaveOrUp = () => {
    setStartX(null);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!startX || !carouselRef.current) return;
    
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Multiply for faster/slower scrolling
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };
  
  // Event handlers for recommended movies carousel
  const handleRecommendedMouseEnter = () => setIsRecommendedPaused(true);
  const handleRecommendedMouseLeave = () => setIsRecommendedPaused(false);
  
  const handleRecommendedMouseDown = (e: React.MouseEvent) => {
    if (!recommendedCarouselRef.current) return;
    setStartXRecommended(e.pageX - recommendedCarouselRef.current.offsetLeft);
    setScrollLeftRecommended(recommendedCarouselRef.current.scrollLeft);
  };
  
  const handleRecommendedMouseLeaveOrUp = () => {
    setStartXRecommended(null);
  };
  
  const handleRecommendedMouseMove = (e: React.MouseEvent) => {
    if (!startXRecommended || !recommendedCarouselRef.current) return;
    
    const x = e.pageX - recommendedCarouselRef.current.offsetLeft;
    const walk = (x - startXRecommended) * 2;
    recommendedCarouselRef.current.scrollLeft = scrollLeftRecommended - walk;
  };
  
  return (
    <div className="home-page">
      <div className="full-width-hero">
        <div className="hero-overlay">
          <div className="hero-content">
            {isAuthenticated ? (
              <h1>Welcome, {user?.name.split(' ')[0]}</h1>
            ) : (
              <div className="welcome-container">
                <h1>Welcome to</h1>
                <img src={logoImage} alt="CineNiche" className="welcome-logo" />
              </div>
            )}
            <p>Discover the world's most intriguing cult classics and rare films</p>
            <Link to="/movies" className="btn-explore">Explore Collection</Link>
          </div>
        </div>
      </div>
      
      {isAuthenticated && (
        <div className="featured-films-section recommended-section">
          <div className="section-header container">
            <h2>Recommended For You</h2>
          </div>
          <div 
            className="film-scroll-container" 
            ref={recommendedCarouselRef}
            onMouseEnter={handleRecommendedMouseEnter}
            onMouseLeave={handleRecommendedMouseLeave}
            onMouseDown={handleRecommendedMouseDown}
            onMouseUp={handleRecommendedMouseLeaveOrUp}
            onMouseMove={handleRecommendedMouseMove}
          >
            <div className="film-scroll-track">
              {extendedRecommendedMovies.map((movie, index) => (
                <div key={`recommended-${movie.id}-${index}`} className="film-item">
                  <img src={movie.src} alt={movie.title} />
                  <p>{movie.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="featured-films-section">
        <div className="section-header container">
          <h2>Recently Added</h2>
        </div>
        <div 
          className="film-scroll-container" 
          ref={carouselRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
        >
          <div className="film-scroll-track">
            {extendedMovieImages.map((movie, index) => (
              <div key={`${movie.id}-${index}`} className="film-item">
                <img src={movie.src} alt={movie.title} />
                <p>{movie.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="container">
        <div className="features">
          <div className="feature">
            <h3>Curated Selection</h3>
            <p>Our catalog spans cult classics, international cinema, indie films, and niche documentaries.</p>
          </div>
          
          <div className="feature">
            <h3>Exclusive Content</h3>
            <p>Access films unavailable on larger mainstream platforms.</p>
          </div>
          
          <div className="feature">
            <h3>Passionate Community</h3>
            <p>Connect with fellow film enthusiasts who share your passion for unique cinema.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 