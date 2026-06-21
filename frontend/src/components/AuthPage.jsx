import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css";
import { toast } from "react-toastify";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showAdminPopup, setShowAdminPopup] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminSecurityKey, setAdminSecurityKey] = useState("");
  const [adminTheaterName, setAdminTheaterName] = useState("");
  const [adminMapUrl, setAdminMapUrl] = useState("");

  const navigate = useNavigate();

  const handlePopupBgClick = (e) => {
    if (e.target.className === "admin-popup-overlay") {
      setShowAdminPopup(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please fill all the fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("fullName", data.user.fullName);
      localStorage.setItem("email", data.user.email);

      navigate("/UserDashboard");

    } catch (error) {
      console.error(error);
      toast.warning("Server Error");
    } finally {
      setEmail("");
      setPassword("");
    }
  };

  // ✅ Signup → switch to login tab
  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      toast.error("Please fill all the fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    localStorage.setItem("fullName", fullName);
    localStorage.setItem("email", email);

    try {
      const res = await fetch("http://localhost:5000/api/user/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Account created successfully!");
      setIsLogin(true);
    } catch (error) {
      console.error(error);
      toast.warning("Server error");
    } finally {
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }
  };

  // ✅ Admin Access → navigate to admin dashboard
  const handleAdminAccess = async () => {
    if (isAdminLogin) {
      if (!adminEmail || !adminPassword || !adminSecurityKey) {
        toast.error("Email, Password, and Security Key are required for login");
        return;
      }
    } else {
      if (!adminEmail || !adminTheaterName || !adminMapUrl || !adminPassword || !adminSecurityKey) {
        toast.error("All fields are required for signup");
        return;
      }
    }

    try {
      const endpoint = isAdminLogin ? "/api/admin/login" : "/api/admin/signup";
      const payload = isAdminLogin
        ? { email: adminEmail, password: adminPassword, securityKey: adminSecurityKey }
        : { email: adminEmail, theaterName: adminTheaterName, mapUrl: adminMapUrl, password: adminPassword, securityKey: adminSecurityKey };

      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Admin access failed. Please check your credentials.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("adminEmail", data.admin.email);
      localStorage.setItem("adminTheaterName", data.admin.theaterName);
      localStorage.setItem("adminId", data.admin._id);
      
      toast.success(isAdminLogin ? "Admin Login Successful" : "Admin Account Created");

      setShowAdminPopup(false);
      navigate("/AdminDashboard");

    } catch (error) {
      console.error(error);
      toast.warning("Server error");
    } finally {
      if (!isLogin) {
        setAdminEmail("");
        setAdminPassword("");
        setAdminSecurityKey("");
        setAdminTheaterName("");
        setAdminMapUrl("");
      }
    }
  };

  return (
    <div className="container">
      {/* LEFT SIDE */}
      <div className="left">
        <div className="logo">
          🎬 <span>MyShow</span>
        </div>

        <h1>
          Your Ultimate <br />
          <span>Cinema</span> Experience
        </h1>

        <p>
          Book your favorite movies, choose your seats, and enjoy the magic of cinema.
        </p>

        <div className="features">
          <div className="feature">
            🎭
            <div>
              <h4>Latest Movies</h4>
              <p>Browse from hundreds of new releases</p>
            </div>
          </div>

          <div className="feature">
            🎟️
            <div>
              <h4>Easy Booking</h4>
              <p>Book tickets in under 2 minutes</p>
            </div>
          </div>

          <div className="feature">
            <button
              className="admin-access-btn"
              onClick={() => setShowAdminPopup(true)}
            >
              Admin Access
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="right">
        <div className="card">
          <div className="tabs">
            <button
              className={isLogin ? "active" : ""}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
            <button
              className={!isLogin ? "active" : ""}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          {isLogin ? (
            <>
              <h2>Welcome back 👋</h2>
              <p className="sub">Sign in to continue to MyShow.</p>

              <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />

              <button onClick={handleLogin} className="main-btn">
                Sign In
              </button>
            </>
          ) : (
            <>
              <h2>Create your account 🎬</h2>
              <p className="sub">Join MyShowand start booking tickets today.</p>

              <input type="text" placeholder="John Doe" className="highlight" value={fullName} onChange={(e) => setFullName(e.target.value)} />

              <div className="row">
                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="row">
                <input type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
                <input type="password" placeholder="Repeat password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>

              <button onClick={handleSignup} className="main-btn">
                + Create Account
              </button>
            </>
          )}
        </div>
      </div>

      {/* ADMIN POPUP */}
      {showAdminPopup && (
        <div className="admin-popup-overlay" onClick={handlePopupBgClick}>
          <div className="admin-popup">
            <h2>Admin Access 🔐</h2>
            <div className="tabs" style={{ marginBottom: "20px" }}>
              <button className={isAdminLogin ? "active" : ""} onClick={() => setIsAdminLogin(true)}>Login</button>
              <button className={!isAdminLogin ? "active" : ""} onClick={() => setIsAdminLogin(false)}>Sign Up</button>
            </div>

            {isAdminLogin ? (
              <>
                <input type="email" placeholder="Email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
                <input type="password" placeholder="Password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
                <input type="text" placeholder="Security Key" value={adminSecurityKey} onChange={(e) => setAdminSecurityKey(e.target.value)} />
              </>
            ) : (
              <>
                <input type="email" placeholder="Email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
                <input type="text" placeholder="Theater Name" value={adminTheaterName} onChange={(e) => setAdminTheaterName(e.target.value)} />
                <input type="url" placeholder="Map Location URL (e.g. Google Maps link)" value={adminMapUrl} onChange={(e) => setAdminMapUrl(e.target.value)} />
                <input type="password" placeholder="Password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
                <input type="text" placeholder="Security Key" value={adminSecurityKey} onChange={(e) => setAdminSecurityKey(e.target.value)} />
              </>
            )}

            <button className="main-btn" onClick={handleAdminAccess}>
              {isAdminLogin ? "Login" : "Sign Up"}
            </button>

            <button
              className="close-btn"
              onClick={() => setShowAdminPopup(false)}
            >
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;