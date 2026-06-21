const { User, Admin, Movie, Booking } = require("./models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const ADMIN_SECURITY_KEY = process.env.ADMIN_SECURITY_KEY || "admin123";

const createToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "90d" });


// USER SIGNUP 
async function userSignup(req, res) {
  try {

    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = new User({
      fullName,
      email,
      passwordHash
    });

    await user.save();

    const token = createToken({ id: user._id, role: user.role || "user" });

    res.status(201).json({ token, user });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


// USER LOGIN
async function userLogin(req, res) {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = createToken({ id: user._id, role: user.role || "user" });

    res.json({ token, user });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


// ADMIN SIGNUP
async function adminSignup(req, res) {
  try {
    const { email, theaterName, mapUrl, password, securityKey } = req.body;

    if (securityKey !== ADMIN_SECURITY_KEY) {
      return res.status(401).json({ message: "Invalid security key" });
    }

    const existingAdmin = await Admin.findOne({ theaterName });

    if (existingAdmin) {
      return res.status(409).json({ message: "Theater already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = new Admin({
      email,
      theaterName,
      mapUrl,
      passwordHash
    });

    await admin.save();

    const token = createToken({ id: admin._id, role: admin.role || "admin" });

    res.status(201).json({ token, admin });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


// ADMIN LOGIN
async function adminLogin(req, res) {
  try {
    const { email, password, securityKey } = req.body;

    if (securityKey !== ADMIN_SECURITY_KEY) {
      return res.status(401).json({ message: "Invalid security key" });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const match = await bcrypt.compare(password, admin.passwordHash);

    if (!match) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = createToken({ id: admin._id, role: admin.role || "admin" });

    res.json({ token, admin });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


// ADD MOVIE
async function addMovie(req, res) {
  try {
    let isAdmin = req.user && req.user.role && String(req.user.role).toLowerCase() === "admin";
    const userId = req.user && (req.user.id || req.user._id);
    if (!isAdmin && userId) {
      const adminExists = await Admin.findById(userId);
      if (adminExists) isAdmin = true;
    }
    if (!isAdmin) {
      return res.status(403).json({ message: "Only admins can add movies" });
    }

    const movie = new Movie({
      ...req.body,
      adminId: req.user.id
    });

    await movie.save();

    res.status(201).json({
      message: "Movie added successfully",
      movie
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({ message: error.message });
  }
}


// GET MOVIES
async function getMovies(req, res) {
  try {
    let filter = {};
    if (req.query.adminId) {
      filter.adminId = req.query.adminId;
    }

    const movies = await Movie.find(filter)
      .populate("adminId", "theaterName mapUrl")
      .sort({ createdAt: -1 });

    // Merge theaterName from populated admin into each movie object
    const moviesWithTheater = movies.map(movie => {
      const obj = movie.toObject();
      obj.theaterName = movie.adminId?.theaterName || "Unknown Theater";
      obj.mapUrl = movie.adminId?.mapUrl || "";
      return obj;
    });

    res.json(moviesWithTheater);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// UPDATE MOVIE
async function updateMovie(req, res) {
  try {
    let isAdmin = req.user && req.user.role && String(req.user.role).toLowerCase() === "admin";
    const userId = req.user && (req.user.id || req.user._id);
    if (!isAdmin && userId) {
      const adminExists = await Admin.findById(userId);
      if (adminExists) isAdmin = true;
    }
    if (!isAdmin) {
      return res.status(403).json({ message: "Only admins can update movies" });
    }

    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json({
      message: "Movie updated successfully",
      movie
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


async function deleteMovie(req, res) {
  try {
    let isAdmin = req.user && req.user.role && String(req.user.role).toLowerCase() === "admin";
    const userId = req.user && (req.user.id || req.user._id);
    if (!isAdmin && userId) {
      const adminExists = await Admin.findById(userId);
      if (adminExists) isAdmin = true;
    }
    if (!isAdmin) {
      return res.status(403).json({ message: "Only admins can delete movies" });
    }
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.json({ message: "Movie deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// CREATE BOOKING
async function createBooking(req, res) {
  try {

    const { movieTitle, showDate, showtime, seats } = req.body;

    // find bookings for same movie + showDate + showtime
    const existingBookings = await Booking.find({
      movieTitle,
      showDate: showDate || { $exists: true }, // fallback for old bookings
      showtime,
      status: { $ne: "cancelled" }
    });

    // collect already booked seats
    const occupiedSeats = existingBookings.flatMap(b => b.seats);

    // check if any selected seat already booked
    const conflictSeat = seats.find(seat => occupiedSeats.includes(seat));

    if (conflictSeat) {
      return res.status(409).json({
        message: `Seat ${conflictSeat} already booked`
      });
    }

    const booking = new Booking(req.body);

    await booking.save();

    res.status(201).json({
      message: "Booking successful",
      booking
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({ message: error.message });

  }
}

// GET USER BOOKINGS
async function getUserBookings(req, res) {
  try {
    const { email } = req.params;
    const bookings = await Booking.find({ email }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// DELETE BOOKING
async function deleteBooking(req, res) {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ message: "Booking deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// CANCEL BOOKING
async function cancelBooking(req, res) {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ message: "Booking cancelled", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// GET ALL BOOKINGS
async function getAllBookings(req, res) {
  try {
    let filter = {};
    if (req.query.adminId) {
      const adminMovies = await Movie.find({ adminId: req.query.adminId });
      const adminMovieTitles = adminMovies.map(m => m.title);
      filter.movieTitle = { $in: adminMovieTitles };
    } else if (req.user && req.user.role === "admin") {
      const adminMovies = await Movie.find({ adminId: req.user.id });
      const adminMovieTitles = adminMovies.map(m => m.title);
      filter.movieTitle = { $in: adminMovieTitles };
    }

    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// GET OCCUPIED SEATS (public - no auth needed)
async function getOccupiedSeats(req, res) {
  try {
    const { movieTitle, showDate, showtime } = req.query;

    if (!movieTitle || !showtime) {
      return res.status(400).json({ message: "movieTitle and showtime are required" });
    }

    const query = {
      movieTitle,
      showtime,
      status: { $ne: "cancelled" }
    };
    if (showDate) query.showDate = showDate;

    const bookings = await Booking.find(query);

    const occupied = bookings.flatMap(b => b.seats || []);

    res.json({ occupiedSeats: [...new Set(occupied)] });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
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
};