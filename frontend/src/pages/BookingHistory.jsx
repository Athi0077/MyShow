import React, { useEffect, useState } from 'react';
import './BookingHistory.css';

const BookingHistory = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const email = localStorage.getItem("email");

    useEffect(() => {
        if (!email) {
            setLoading(false);
            return;
        }

        const token = localStorage.getItem("token");
        fetch(`https://myshow-5n9t.onrender.com/api/bookings/${email}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setBookings(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [email]);

    if (loading) return <div className="bh-message">Loading your tickets...</div>;

    if (!email) return <div className="bh-message">Please log in to see your bookings.</div>;

    if (bookings.length === 0) return <div className="bh-message bh-empty">You have no bookings yet! Time to catch a movie 🍿</div>;

    const handleCancel = (id) => {
        const token = localStorage.getItem("token");
        fetch(`https://myshow-5n9t.onrender.com/api/bookings/${id}/cancel`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setBookings(bookings.map(b => b._id === id ? { ...b, status: "cancelled" } : b));
            })
            .catch(err => {
                console.error(err);
            });
    };

    const handleDelete = (id) => {
        const token = localStorage.getItem("token");
        fetch(`https://myshow-5n9t.onrender.com/api/bookings/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setBookings(bookings.filter(b => b._id !== id));
            })
            .catch(err => {
                console.error(err);
            });
    };

   return (
  <div className="bh-container">
    <h2 className="bh-title">🎟 Your Movie Tickets</h2>

    <div className="bh-list">
      {bookings && Array.isArray(bookings) && bookings.map((b) => (
        
        <div key={b._id} className="ticket">

          {/* LEFT SIDE */}
          <div className="ticket-left">

            {b.posterUrl && (
              <img src={b.posterUrl} alt={b.movieTitle} className="ticket-poster" />
            )}

          </div>


          {/* RIGHT SIDE */}
          <div className="ticket-right">

            <div className="ticket-header">
              <h3>{b.movieTitle} - {b.theatreName}</h3>

              {b.status !== "cancelled" ? (
                <button className="cancel-btn" onClick={() => handleCancel(b._id)}>
                  Cancel
                </button>
              ) : (
                <span className="cancelled">Cancelled</span>
              )}
            </div>

            <div className="ticket-info">
              {b.showDate && <p>📅 Date: <strong>{b.showDate}</strong></p>}
              <p>🕒 Showtime: <strong>{b.showtime}</strong></p>
              <p>🎟 Tickets: <strong>{b.tickets}</strong></p>
              {b.seats && (
                <p>💺 Seats: <strong>{b.seats.join(", ")}</strong></p>
              )}
            </div>

            <div className="ticket-footer">
              <span className="price">${b.totalAmount}</span>
              <span className="date">
                {new Date(b.createdAt).toLocaleDateString()}
              </span>

              {/* <button
                className="delete-btn"
                onClick={() => handleDelete(b._id)}
              >
                Delete
              </button> */}
            </div>

          </div>

        </div>

      ))}
    </div>
  </div>
);
}

export default BookingHistory;