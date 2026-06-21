import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AuthPage from "./components/AuthPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MovieManagement from "./pages/MovieManagement";
import BookingManagement from "./pages/BookingManagement";
import AddNewMovieForm from "./pages/AddNewMovieForm";
import MyBookings from "./pages/MyBookings";
import BookingForm from "./pages/BookingForm";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
         <ToastContainer position="top-right" autoClose={3000}  hideProgressBar={false}/>

      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/UserDashboard" element={<UserDashboard />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/MovieManagement" element={<MovieManagement />} />
        <Route path="/BookingManagement" element={<BookingManagement />} />
        <Route path="/addnewmovieform" element={<AddNewMovieForm />} />
        <Route path="/MyBookings" element={<MyBookings />} />
        <Route path="/BookingForm" element={<BookingForm />} />
      </Routes>
    </Router>
  );
}

export default App;