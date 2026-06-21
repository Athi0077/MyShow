const express = require("express");
const router = express.Router();

const {
  userSignup,
  userLogin,
  adminSignup,
  adminLogin,
  addMovie,
  getMovies,
  updateMovie,
  deleteMovie,
  createBooking,
  getUserBookings,
  deleteBooking,
  cancelBooking,
  getAllBookings,
  getOccupiedSeats
} = require("./controllers");

const authMiddleware = require("./authMiddleware");


// USER
router.post("/user/signup", userSignup);
router.post("/user/login", userLogin);


// ADMIN
router.post("/admin/signup", adminSignup);
router.post("/admin/login", adminLogin);


// MOVIES
router.post("/admin/add-movie", authMiddleware, addMovie);
router.get("/movies", getMovies);
router.put("/movies/:id", authMiddleware, updateMovie);
router.delete("/movies/:id", authMiddleware, deleteMovie);

// BOOKINGS
router.post("/bookings", createBooking);
router.get("/bookings", authMiddleware, getAllBookings);
router.get("/bookings/:email", authMiddleware, getUserBookings);
router.delete("/bookings/:id", authMiddleware, deleteBooking);
router.put("/bookings/:id/cancel", authMiddleware, cancelBooking);

// SEATS (public)
router.get("/seats/occupied", getOccupiedSeats);

// TEST PROTECTED ROUTE
router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route",
    user: req.user
  });
});


module.exports = router;