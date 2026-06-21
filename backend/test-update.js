
async function test() {
  // 1. Admin login
  console.log("Logging in as admin...");
  const loginRes = await fetch("http://localhost:5000/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@example.com", // Need an actual admin email
      password: "password123",
      securityKey: "1432" // from backend/controllers.js ADMIN_SECURITY_KEY
    })
  });
  
  if (!loginRes.ok) {
    console.log("Login failed! Trying to signup first...");
    const signupRes = await fetch("http://localhost:5000/api/admin/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "testadmin99@example.com",
        theaterName: "Test Theater 99",
        mapUrl: "http://map",
        password: "password123",
        securityKey: "1432"
      })
    });
    const signupData = await signupRes.json();
    console.log("Signup:", signupData);
    if (!signupRes.ok) return;
    var token = signupData.token;
  } else {
    const loginData = await loginRes.json();
    console.log("Login success.");
    var token = loginData.token;
  }

  // 2. Fetch movies
  console.log("Fetching movies...");
  const moviesRes = await fetch("http://localhost:5000/api/movies");
  const movies = await moviesRes.json();
  
  if (movies.length === 0) {
    console.log("No movies found to update.");
    return;
  }
  
  const movie = movies[0];
  console.log("Updating movie:", movie._id);
  
  // 3. Update movie
  const updateRes = await fetch(`http://localhost:5000/api/movies/${movie._id}`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      title: movie.title + " Updated"
    })
  });
  
  const updateData = await updateRes.json();
  console.log("Update status:", updateRes.status);
  console.log("Update response:", updateData);
}

test();
