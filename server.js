require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// 1. Fix: Correct Port Priority
const PORT = process.env.PORT || 5000; 

const app = express();
connectDB();

// 2. Fix: Multi-origin support (Local + Netlify)
const allowedOrigins = [
  "http://localhost:5174" // Your local Vite/React port
  
];

const corsOption = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  exposedHeaders: ['Content-Length', 'Authorization', 'token'],
};

app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json('Api Working Fine');
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/noteRoutes"));

// 3. Fix: Start the server for local testing
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;