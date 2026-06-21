import "./admin.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function BookingManagement() {
  const [search, setSearch] = useState("");
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

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
    const token = localStorage.getItem("token");
    const adminId = localStorage.getItem("adminId");
    const url = adminId && adminId !== "null" && adminId !== "undefined"
      ? `http://localhost:5000/api/bookings?adminId=${adminId}`
      : `http://localhost:5000/api/bookings`;

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setBookings(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err));
  }, []);

  const filteredBookings = bookings.filter(b =>
    b.movieTitle.toLowerCase().includes(search.toLowerCase()) ||
    b.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-container">
      <div className="navbar">
        <div className="myshowlogo">🎬 MyShow</div>
        <div className="nav-links">
          <a onClick={() => navigate('/AdminDashboard')}>Dashboard</a>
          <a onClick={() => navigate('/MovieManagement')}>Movies</a>
          <a className="active" onClick={() => navigate('/BookingManagement')}>Bookings</a>
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


      <h1>Booking Management</h1>

      <div className="booking-cards">

        <div className="card">
          <h3>Total Bookings</h3>
          <p className="card-number">{bookings.length}</p>
        </div>


        <div className="card">
          <h3>Cancelled</h3>
          <p className="card-number">{Array.isArray(bookings) ? bookings.filter(b => b.status === "cancelled").length : 0}</p>
        </div>

        <div className="card">
          <h3>Revenue</h3>
          <p className="card-number">{Array.isArray(bookings) ? bookings.filter(b => b.status !== "cancelled").reduce((sum, b) => sum + Number(b.totalAmount || 0), 0).toFixed(2) : "0.00"}</p>
        </div>

      </div>

      <input
        className="search"
        placeholder="Search by movie or user..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="admin-table">

        <thead>
          <tr>
            <th>No</th>
            <th>Customer</th>
            <th>Movie</th>
            <th>Show Date</th>
            <th>Showtime</th>
            <th>Seats</th>
            <th>Seat Nos</th>
            <th>Amount</th>
            <th>Booked On</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {filteredBookings.map((b, i) => (
            <tr key={b._id}>
              <td>{i + 1}</td>
              <td>{b.fullName}</td>
              <td>{b.movieTitle}</td>
              <td>{b.showDate || "-"}</td>
              <td>{b.showtime}</td>
              <td>{b.tickets}</td>
              <td>{b.seats.join(", ")}</td>
              <td>${b.totalAmount}</td>
              <td>{new Date(b.createdAt).toLocaleDateString()}</td>
              <td style={{ color: b.status === "cancelled" ? "red" : "green" }}>{b.status === "cancelled" ? "Cancelled" : "Confirmed"}</td>
            </tr>
          ))}


        </tbody>

      </table>

    </div>
  );
}