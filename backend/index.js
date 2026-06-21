const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors()); 
app.use(express.json({ limit: "10mb" }));

// ROUTES
const routes = require("./routes");

app.use("/api", routes);

mongoose.connect(process.env.MONGO_URI) 
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log(err));  

app.listen(process.env.PORT, () => {
  console.log(`Backend Running Successfully`);
});