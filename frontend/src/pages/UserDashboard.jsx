import { useEffect, useState } from "react";
import "./UserDashboard.css";
import { useNavigate } from "react-router-dom";
import BookingForm from "./BookingForm";
import { toast } from "react-toastify";

export default function UserDashboard() {

  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const fullName = localStorage.getItem("fullName") || "User";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("fullName");
    localStorage.removeItem("email");
    navigate("/");
  };

  // Fetch movies
  useEffect(() => {
    fetch("http://localhost:5000/api/movies")
      .then(res => res.json())
      .then(data => setMovies(data))
      .catch(err => console.log(err));
  }, []);

  // Latest 3 movies
  const latestMovies = movies.length > 0 ? movies.slice(-3).reverse() : [];

  useEffect(() => {
    if (latestMovies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % latestMovies.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [latestMovies.length]);

  // Filter movies
  const filteredMovies = Array.isArray(movies) ? movies.filter(movie => {
    const movieGenres = movie?.genre ? movie.genre.split(',').map(g => g.trim()) : [];
    return (
      movie?.title?.toLowerCase().includes(search?.toLowerCase() || "") &&
      (category === "All" || movieGenres.some(g => g.toLowerCase() === category.toLowerCase()))
    );
  }) : [];

  return (
    <div className="dashboard">

      {/* NAVBAR */}

      <div className="navbar">

        <h1 className="logo">🎬 MyShow</h1>

        <div className="nav-links">
          <a className="active">Browse</a>
          <a onClick={() => navigate("/MyBookings")}>My Bookings</a>
        </div>

        <button
          style={{ backgroundColor: "#fc3030", color: "white", left:"100px"}}
          className="logout-btn"
          onClick={() => {
            toast.success("Logout successfully");
            handleLogout();
          }}
        >
          Logout
        </button>

      </div>

      {/* HERO SECTION */}

      {latestMovies.length > 0 && (
        <div className="hero-slider">

          <div
            className="hero-track"
            style={{ transform: `translate3d(-${currentHeroIndex * 100}%,0,0)` }}
          >
            {latestMovies.map((movie) => (
              <div
                key={movie._id}
                className="hero-slide"
                style={{ backgroundImage: `url(${movie.posterUrl})` }}
              >
                <div className="hero-overlay" />

                <div className="hero-content">
                  <h1>{movie.title}</h1>
                  <p>{movie.description}</p>

                  <button
                    className="hero-book-btn"
                    onClick={() => setSelectedMovie(movie)}
                  >
                    🎟 Book Tickets
                  </button>
                  <a 
                    href={movie.mapUrl || "#"} 
                    target={movie.mapUrl ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="hero-theater"
                    style={{ color: "white", textDecoration: "none", display: "inline-block", marginTop: "15px" }}
                  >
                    📍 {movie.theaterName}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Slider dots */}
          <div className="hero-dots">
            {latestMovies.map((_, i) => (
              <span
                key={i}
                className={`dot ${i === currentHeroIndex ? "active" : ""}`}
                onClick={() => setCurrentHeroIndex(i)}
              />
            ))}
          </div>

        </div>
      )}

      {/* WELCOME SECTION */}

      <div className="welcome">

        <h2>Welcome back, {fullName}! 🎬</h2>

        <p>
          {movies.length} movies available — what will you watch today?
        </p>

      </div>

      {/* SEARCH */}

      <div className="search-container">

        <input
          type="text"
          placeholder="Search movies, genres..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      {/* CATEGORY */}

      <div className="categories">

        {["All", "Horror", "Comedy", "Sci-Fi", "Romance", "Animation", "Action", "Entertainment"].map(cat => (

          <button
            key={cat}
            className={category === cat ? "active" : ""}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>

        ))}

      </div>

      {/* MOVIES GRID */}

      <div className="movies-grid">
        {filteredMovies?.map((movie) => (
          <div key={movie?._id} className="movie-card">

            {/* Rating Badge */}
            <div className="rating-badge">{movie.rating}</div>

            {/* Poster */}
            <img
              className="movie-poster"
              src={movie.posterUrl}
              alt={movie.title}
            />

            {/* Genre Tag */}
            <div className="genre-tag">{movie?.genre ? movie.genre.split(",").map(g => g.trim()).join(", ") : "Unknown"}</div>

            <div className="movie-info">

              <h3>{movie.title}</h3>

              <div className="movie-meta">
                <span>⏱ {movie.duration} min</span>
                <span>🌐 {movie.language}</span>
              </div>

              <p className="movie-desc">
                {movie.description.substring(0, 110)}...
              </p>

              <div className="showtimes">
                {movie.showDate && (
                  <div style={{ marginBottom: "5px" }}>
                    <span>📅 Dates:</span>
                    {movie.showDate.split("|").map((dt, index) => (
                      <span key={index}>{dt.trim()}</span>
                    ))}
                  </div>
                )}
                <span>🎬 Showtimes:</span>
                {(movie?.showtime ? movie.showtime.split("|") : (movie?.showtimes || [])).map((st, index) => (
                  <span key={index}>{typeof st === "string" ? st.trim() : st}</span>
                ))}
              </div>

              {/* <div className="seats">
                Seat Availability
                <span className="seat-count">{movie.seatsAvailable} / {movie.totalSeats} seats</span>
              </div> */}

              <div className="price-book">
                <div className="price">${movie.price}</div>

                <button
                  className="book-btn"
                  onClick={() => setSelectedMovie(movie)}
                >
                  🎟 Book Now
                </button>
              </div>
              <a
                href={movie.mapUrl || "#"}
                target={movie.mapUrl ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="movie-theater"
              >📍 {movie.theaterName}</a>

            </div>

          </div>
        ))}
      </div>

      {/* BOOKING MODAL */}
      {selectedMovie && (
        <BookingForm
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}