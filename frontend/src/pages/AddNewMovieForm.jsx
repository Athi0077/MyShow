import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AddMovieForm.css";
import { toast } from "react-toastify";

export default function AddNewMovieForm({ onClose, movieData }) {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    genre: "",
    description: "",
    duration: "",
    price: "",
    totalSeats: "",
    rating: "PG",
    language: "",
    status: "active",
    showDate: "",
    showtime: "",
    posterUrl: "" 
  });

  useEffect(() => {
    if (movieData) {
      setForm(movieData);
    }
  }, [movieData]);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("You must be logged in to perform this action.");
        navigate("/");
        return;
      }
      const url = movieData
        ? `https://myshow-5n9t.onrender.com/api/movies/${movieData._id}`
        : "https://myshow-5n9t.onrender.com/api/admin/add-movie";

      const method = movieData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to save movie");
        return;
      }

      toast.success(movieData ? "Movie updated" : "Movie added");

      handleClose();

    } catch (error) {
      console.error(error);
      toast.warning("An error occurred");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="movie-form-container">
        <h2 className="form-title">{movieData ? "Edit Movie" : "Add Movie"}</h2>
        <button className="close-btn" onClick={handleClose}>×</button>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Movie Title</label>
              <input
                placeholder="Avatar: The Way of Water"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Genre</label>
              <input
                placeholder="Action / Adventure"
                value={form.genre}
                onChange={(e) => handleChange("genre", e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Duration (mins)</label>
              <input
                type="number"
                placeholder="148"
                value={form.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Ticket Price</label>
              <input
                type="number"
                placeholder="15.99"
                value={form.price}
                onChange={(e) => handleChange("price", e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Total Seats</label>
              <input
                type="number"
                placeholder="120"
                value={form.totalSeats}
                onChange={(e) => handleChange("totalSeats", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Rating</label>
              <select
                value={form.rating}
                onChange={(e) => handleChange("rating", e.target.value)}
              >
                <option>G</option>
                <option>PG</option>
                <option>PG-13</option>
                <option>R</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Language</label>
              <input
                type="text"
                placeholder="English"
                value={form.language}
                onChange={(e) => handleChange("language", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Show Date</label>
              <input
                type="text"
                placeholder="2024-05-10 | 2024-05-11"
                value={form.showDate}
                onChange={(e) => handleChange("showDate", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Showtime Schedule</label>
              <input
                type="text"
                placeholder="10:00 AM | 2:00 PM | 6:00 PM"
                value={form.showtime}
                onChange={(e) => handleChange("showtime", e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Poster Image URL</label>
            <input
              type="text"
              placeholder="https://poster.jpg"
              value={form.posterUrl}
              onChange={(e) => handleChange("posterUrl", e.target.value)}
            />
            {form.posterUrl && (
              <img
                src={form.posterUrl}
                alt="preview"
                className="poster-preview"
              />
            )}
          </div>

          <div className="form-buttons">
            <button type="button" className="cancel-btn" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              {movieData ? "Update Movie" : "Add Movie"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}