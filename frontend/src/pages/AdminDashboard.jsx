import "./admin.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AddNewMovieForm from "./AddNewMovieForm"; // import form
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function AdminDashboard() {

  const [showAddMovie, setShowAddMovie] = useState(false);

  const navigate = useNavigate();

  const handleAddMovieClick = () => {
    setShowAddMovie(true);
  };

  const handleCloseAddMovie = () => {
    setShowAddMovie(false);
    fetchMovies();
  };

  const [movies, setMovies] = useState([]);

  const fetchMovies = async () => {
    try {
      const adminId = localStorage.getItem("adminId");
      const url = adminId && adminId !== "null" && adminId !== "undefined"
        ? `http://localhost:5000/api/movies?adminId=${adminId}`
        : `http://localhost:5000/api/movies`;

      const res = await fetch(url);
      const data = await res.json();
      setMovies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setMovies([]);
    }
  };

  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const adminId = localStorage.getItem("adminId");
      const url = adminId && adminId !== "null" && adminId !== "undefined"
        ? `http://localhost:5000/api/bookings?adminId=${adminId}`
        : `http://localhost:5000/api/bookings`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("fullName");
    localStorage.removeItem("email");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminTheaterName");
    localStorage.removeItem("adminId");
    navigate("/");
  };

  useEffect(() => {
    fetchMovies();
    fetchBookings();
  }, []);

  const adminTheaterName = localStorage.getItem("adminTheaterName") || "Admin";

  const totalRevenue = Array.isArray(bookings) ? bookings.filter(b => b.status !== "cancelled").reduce((acc, booking) => acc + (Number(booking.totalAmount) || 0), 0) : 0;

  return (
    <div className="admin-container">

      {/* Navbar */}
      <div className="navbar">
        <div className="myshowlogo">🎬 MyShow</div>

        <div className="nav-links">
          <a className="active" onClick={() => navigate('/AdminDashboard')}>Dashboard</a>
          <a onClick={() => navigate('/MovieManagement')}>Movies</a>
          <a onClick={() => navigate('/BookingManagement')}>Bookings</a>
          <button
            style={{ backgroundColor: "#fc3030", color: "white" }}
            className="logout-btn"
            onClick={() => {
              toast.success("Logout successfully");
              handleLogout();
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <h1 className="admin-title">
        {new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 18 ? "Good Afternoon" : "Good Evening"},
        <span className="admin-name">{adminTheaterName}</span> 👋
      </h1>
      <p className="admin-subtitle">Here's what's happening with MyShow today.</p>

      {/* Dashboard Cards */}
      <div className="dashboard-cards">

        <div className="card">
          <h3>Total Bookings</h3>
          <p className="card-number">
            {bookings.length}
          </p>
        </div>


        <div className="card">
          <h3>Total Revenue</h3>
          <p className="card-number">₹{totalRevenue.toFixed(2)}</p>
        </div>

        <div className="card">
          <h3>Active Movies</h3>
          <p className="card-number">
            {
              movies.filter((movie) => movie.status && movie.status.toLowerCase() === "active").length
            }
          </p>
        </div>

        {/*cancelled bookings*/}
        <div className="card">
          <h3>Cancelled Bookings</h3>
          <p className="card-number">
            {
              bookings.filter((booking) => booking.status === "cancelled").length
            }
          </p>
        </div>

      </div>

      <div className="dashboard-grid">

        <div className="recent-bookings">
          <h2>Recent Bookings</h2>

          {bookings.length === 0 ? (
            <p style={{ color: "#aaa", textAlign: "center", padding: "20px" }}>No bookings available.</p>
          ) : (
            bookings.slice(0, 5).map(b => (
              <div key={b._id} className="booking-item">
                <div>
                  <h4 className="booking-title">{b.movieTitle}</h4>
                  <p className="booking-user">{b.fullName} • {b.tickets} seat(s)</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span className={`status ${b.status === "cancelled" ? "cancelled" : "confirmed"}`}>{b.status}</span>
                  <span style={{ fontSize: '13px', marginTop: '6px', fontWeight: 'bold', color: '#00e676' }}>₹{b.totalAmount}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="movies-overview">
          <h2>Movies Overview</h2>

          {movies.length === 0 ? (
            <p style={{ color: "#aaa", textAlign: "center", padding: "20px" }}>No movies added yet.</p>
          ) : (
            movies.slice(0, 5).map((movie) => (
              <div className="movie-item" key={movie._id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <img src={movie.posterUrl || 'https://via.placeholder.com/40x60'} alt={movie.title} style={{ width: '40px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} />
                  <div>
                    <h4>{movie.title}</h4>
                    <p style={{ fontSize: '12px', color: '#ccc', margin: '5px 0 0 0' }}>{movie.genre || 'N/A'} • {movie.language || 'N/A'} • {movie.duration || '0'} min</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span className={`status ${movie.status ? movie.status.toLowerCase() : 'inactive'}`} style={{ textTransform: 'capitalize' }}>{movie.status || 'Inactive'}</span>
                  <span style={{ fontSize: '12px', marginTop: '5px', color: '#888' }}>₹{movie.price || '0'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>


      {/* Quick Actions */}
      <div className="quickaction">

        <h2>Quick Actions</h2>

        <div className="quickaction-buttons">

          <button onClick={handleAddMovieClick}>
            + Add New Movie
          </button>

          <button onClick={() => navigate('/MovieManagement')}>
            View Movies
          </button>

          <button onClick={() => navigate('/BookingManagement')}>
            View Bookings
          </button>

        </div>

      </div>

      {/* Modal Form */}
      {showAddMovie && (
        <AddNewMovieForm onClose={handleCloseAddMovie} />
      )}

    </div>
  );
}