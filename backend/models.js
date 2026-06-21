const mongoose = require("mongoose");

// USER
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: "user" }
}, { timestamps: true });

// ADMIN
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true },
  theaterName: { type: String, required: true },
  mapUrl: { type: String, default: "" },
  passwordHash: { type: String, required: true },
  role: { type: String, default: "admin" }
}, { timestamps: true });

// MOVIE
const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  rating: { type: String, required: true },
  language: { type: String, required: true },
  status: { type: String, required: true },
  showDate: { type: String, required: true },
  showtime: { type: String, required: true },
  posterUrl: { type: String, required: true },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  }
}, { timestamps: true });

// BOOKING
const bookingSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  movieTitle: { type: String, required: true },
  theatreName: { type: String, required: true },
  posterUrl: { type: String, required: true },
  showDate: { type: String, required: true },
  showtime: { type: String, required: true },
  tickets: { type: Number, required: true },
  seats: { type: [String], required: true },
  totalAmount: { type: Number, required: true },
  paymentId: { type: String, required: true },
  status: { type: String, default: "confirmed" }
}, { timestamps: true });

// PREVENT MODEL OVERWRITE
const User = mongoose.models.User || mongoose.model("User", userSchema);
const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
const Movie = mongoose.models.Movie || mongoose.model("Movie", movieSchema);
const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

module.exports = { User, Admin, Movie, Booking };