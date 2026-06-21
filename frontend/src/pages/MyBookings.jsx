import { useNavigate } from "react-router-dom";
import BookingHistory from "./BookingHistory";
import { toast } from "react-toastify";

export default function MyBookings() {

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("fullName");
        localStorage.removeItem("email");
        navigate("/");
    };

    return (
        <div>
            <div className="navbar">

                <div className="logo">🎬 MyShow</div>

                <div className="nav-links">
                    <a onClick={() => navigate("/UserDashboard")}>Browse</a>
                    <a className="active" onClick={() => navigate("/MyBookings")}>My Bookings</a>
                </div>

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
            <BookingHistory />

        </div>
    );
}