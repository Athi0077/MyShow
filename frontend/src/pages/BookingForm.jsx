import { useState, useEffect } from "react";
import "./BookingForm.css";
import { processPayment } from "../utils/payement";
import { toast } from "react-toastify";

export default function BookingForm({ movie, onClose }) {

    const availableDates = movie.showDate ? movie.showDate.split("|").map(d => d.trim()) : [];
    const availableTimes = movie.showtime ? movie.showtime.split("|").map(t => t.trim()) : ["10:00 AM", "2:00 PM", "6:00 PM", "10:00 PM"];

    const [step, setStep] = useState(1);
    const [showDate, setShowDate] = useState(availableDates[0] || "");
    const [showtime, setShowtime] = useState(availableTimes[0] || "10:00 AM");
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [occupiedSeats, setOccupiedSeats] = useState([]);

    const rows = ["A", "B", "C", "D", "E", "F", "G"];
    const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const price = movie.price || 15.99;

    const fullName = localStorage.getItem("fullName") || "User";
    const email = localStorage.getItem("email") || "user@mail.com";

    const tickets = selectedSeats.length;
    const total = price * tickets;

    // Fetch booked seats
    useEffect(() => {

        const fetchOccupiedSeats = async () => {

            try {

                const params = new URLSearchParams({
                    movieTitle: movie.title,
                    showtime
                });
                if (showDate) params.append("showDate", showDate);

                const res = await fetch(`http://localhost:5000/api/seats/occupied?${params}`);
                const data = await res.json();

                setOccupiedSeats(data.occupiedSeats || []);

            } catch (err) {
                console.error(err);
            }

        };

        fetchOccupiedSeats();

    }, [movie.title, showtime, showDate]);



    // Seat Click Handler
    const handleSeatClick = (seatId) => {

        const isOccupied = occupiedSeats.includes(seatId);
        const isSelected = selectedSeats.includes(seatId);

        if (isOccupied) {
            toast.error("Seat already booked");
            return;
        }

        if (isSelected) {

            setSelectedSeats(selectedSeats.filter((s) => s !== seatId));

        } else {

            if (selectedSeats.length >= 8) {
                toast.error("Maximum 8 seats per booking");
                return;
            }

            setSelectedSeats([...selectedSeats, seatId]);
        }

    };


    // Payment
    const handlePayment = async () => {

        try {

            const payment = await processPayment({
                amount: total,
                userName: fullName,
                userEmail: email
            });

            if (payment.paymentId) {

                const res = await fetch("http://localhost:5000/api/bookings", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        fullName,
                        email,
                        movieTitle: movie.title,
                        posterUrl: movie.posterUrl,
                        showDate,
                        showtime,
                        tickets,
                        seats: selectedSeats,
                        totalAmount: total,
                        paymentId: payment.paymentId,
                        theatreName: movie.theaterName
                    })
                });

                // if (res.ok) {
                //     toast.success("Booking Successful 🎉");
                //     setSelectedSeats([]);
                //     setTimeout(() => {
                //         window.location.reload();
                //     }, 2000);
                // } else {
                //     toast.error("Booking save failed");
                // }
                if (res.ok) {
                    setSelectedSeats([]);
                    window.location.reload();
                    toast.success("Booking Successful 🎉");
                } else {
                    toast.error("Booking save failed");
                }

            }

        } catch (err) {
            console.log(err);
        }

    };


    return (

        <div className="booking-overlay">

            <div className="booking-modal">

                {/* Header */}

                <div className="booking-header">

                    <div>
                        <h3>{movie.title}</h3>
                        <p>{movie.genre}</p>
                        {movie.showDate && <p style={{ fontSize: "0.9rem", color: "#ddd" }}>📅 Date: {movie.showDate}</p>}
                    </div>

                    <button className="close-btn" onClick={onClose}>✕</button>

                </div>


                {/* STEP 1 */}
                {step === 1 && (

                    <div className="step">

                        {availableDates.length > 0 && (
                            <>
                                <h3>Select Date</h3>
                                <div className="showtimes" style={{ marginBottom: "15px" }}>
                                    {availableDates.map(date => (
                                        <button
                                            key={date}
                                            className={showDate === date ? "active" : ""}
                                            onClick={() => setShowDate(date)}
                                        >
                                            {date}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        <h3>Select Showtime</h3>
                        <div className="showtimes">

                            {availableTimes.map(time => (

                                <button
                                    key={time}
                                    className={showtime === time ? "active" : ""}
                                    onClick={() => setShowtime(time)}
                                >
                                    {time}
                                </button>

                            ))}

                        </div>

                        <div className="price-box">
                            <p>Price per ticket</p>
                            <p>${price}</p>
                        </div>

                        <button
                            className="confirm-btn"
                            onClick={() => {
                                setSelectedSeats([]);
                                setStep(2);
                            }}
                        >
                            Continue to Seats
                        </button>

                    </div>

                )}



                {/* STEP 2 SEATS */}

                {step === 2 && (

                    <div className="step">

                        <h3>Select Seats</h3>

                        <p style={{ color: "#aaa" }}>
                            Selected {selectedSeats.length} seats
                        </p>

                        <div className="seats-container">

                            <div className="screen"></div>

                            <div className="seat-grid">

                                {rows.map((row) => (

                                    <div key={row} className="seat-row">

                                        {cols.map((col) => {

                                            const seatId = `${row}${col}`;

                                            const isSelected = selectedSeats.includes(seatId);
                                            const isOccupied = occupiedSeats.includes(seatId);

                                            return (

                                                <div
                                                    key={seatId}
                                                    className={`seat 
                            ${isSelected ? "selected" : ""} 
                            ${isOccupied ? "occupied" : ""}`}
                                                    onClick={() => handleSeatClick(seatId)}
                                                    title={isOccupied ? "Occupied" : "Available"}
                                                >
                                                    {seatId}
                                                </div>

                                            );

                                        })}

                                    </div>

                                ))}

                            </div>

                        </div>


                        <div className="confirm-actions">

                            <button
                                className="back-btn"
                                onClick={() => setStep(1)}
                            >
                                Back
                            </button>

                            <button
                                className="confirm-btn"
                                disabled={selectedSeats.length === 0}
                                onClick={() => setStep(3)}
                                style={{
                                    opacity: selectedSeats.length ? 1 : 0.5,
                                    flex: 2,
                                    marginLeft: "10px"
                                }}
                            >
                                Review Booking
                            </button>

                        </div>

                    </div>

                )}



                {/* STEP 3 CONFIRM */}

                {step === 3 && (

                    <div className="step">

                        <h3>Confirm Booking</h3>

                        <div className="confirm-box">

                            <p><strong>Movie:</strong> {movie.title}</p>

                            {showDate && <p><strong>Date:</strong> {showDate}</p>}

                            <p><strong>Showtime:</strong> {showtime}</p>

                            <p><strong>Seats:</strong> {selectedSeats.join(", ")}</p>

                            <p><strong>Customer:</strong> {fullName}</p>

                            <p><strong>Email:</strong> {email}</p>

                            <p><strong>Theatre:</strong> {movie.theaterName}</p>

                            <h2 style={{ marginTop: "15px" }}>
                                Total: ${total}
                            </h2>

                        </div>

                        <div className="confirm-actions">

                            <button
                                className="back-btn"
                                onClick={() => setStep(2)}
                            >
                                Back
                            </button>

                            <button
                                className="pay-btn"
                                onClick={handlePayment}
                            >
                                Confirm & Pay
                            </button>

                        </div>

                    </div>

                )}

            </div>

        </div>

    );

}   