import "./admin.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AddNewMovieForm from "./AddNewMovieForm";
import { toast } from "react-toastify";

export default function MovieManagement() {

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);

  const fetchMovies = async () => {
    try {
      const adminId = localStorage.getItem("adminId");
      const url = adminId && adminId !== "null"
        ? `https://myshow-5n9t.onrender.com/api/movies?adminId=${adminId}`
        : `https://myshow-5n9t.onrender.com/api/movies`;

      const res = await fetch(url);
      const data = await res.json();

      setMovies(Array.isArray(data) ? data : []);

    } catch (error) {
      console.error("Fetch error:", error);
      setMovies([]);
    }
  };

  useEffect(() => {

    fetchMovies();

  }, []);

  const editMovie = (movie) => {

    setSelectedMovie(movie);
    setOpen(true);

  };

  const deleteMovie = async (id) => {

    const confirmDelete = window.confirm("Delete this movie?");
    if (!confirmDelete) return;

    try {

      const token = localStorage.getItem("token");

      await fetch(`https://myshow-5n9t.onrender.com/api/movies/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      fetchMovies();

    } catch (error) {

      console.error("Delete error:", error);

    }
  };

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(search.toLowerCase()) ||
    movie.genre.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("fullName");
    localStorage.removeItem("email");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminTheaterName");
    localStorage.removeItem("adminId");
    navigate("/");
  };

  return (

    <div className="admin-container">

      <div className="navbar">

        <div className="myshowlogo">🎬 MyShow</div>

        <div className="nav-links">

          <a onClick={() => navigate("/AdminDashboard")}>Dashboard</a>
          <a className="active" onClick={() => navigate("/MovieManagement")}>Movies</a>
          <a onClick={() => navigate("/BookingManagement")}>Bookings</a>

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

      <div className="header-row">

        <h1>Movie Management</h1>

        <button
          className="add-btn"
          onClick={() => {
            setSelectedMovie(null);
            setOpen(true);
          }}
        >
          + Add New Movie
        </button>

      </div>

      {open && (

        <AddNewMovieForm
          movieData={selectedMovie}
          onClose={() => {
            setOpen(false);
            fetchMovies();
          }}
        />

      )}

      <input
        className="search"
        placeholder="Search movies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="admin-table">

        <thead>

          <tr>
            <th>Poster</th>
            <th>Movie</th>
            <th>Genre</th>
            <th>Duration</th>
            <th>Price</th>
            <th>Seats</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>

        </thead>

        <tbody>

          {filteredMovies.length === 0 ? (

            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>
                No movies found
              </td>
            </tr>

          ) : (

            filteredMovies.map((movie) => (

              <tr key={movie._id}>

                <td>
                  <img width="100px" src={movie.posterUrl} alt="" />
                </td>

                <td>{movie.title}</td>
                <td>{movie.genre}</td>
                <td>{movie.duration} min</td>
                <td>₹{movie.price}</td>
                <td>{movie.totalSeats}</td>

                <td>
                  <span className={`status ${movie.status}`}>
                    {movie.status}
                  </span>
                </td>

                <td>

                  <button
                    className="edit"
                    onClick={() => editMovie(movie)}
                  >
                    ✏
                  </button>

                  <button
                    className="delete"
                    onClick={() => deleteMovie(movie._id)}
                  >
                    🗑
                  </button>

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>

  );
}