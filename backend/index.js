import dotenv from "dotenv";
import { sequelize } from "./src/models/index.js";
import rateLimit from "express-rate-limit";
import app from "./src/routes/route.js";
import express from "express";

dotenv.config();

const PORT = process.env.PORT || 3002;

// Initialize Express app
const server = express();

// Enable trust proxy to handle the 'X-Forwarded-For' header
server.set("trust proxy", true);

// Set up rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting middleware to all routes
server.use(limiter);

// Wrap the rate-limited handler
export default async (req, res) => {
  try {
    // Apply rate limiting before database authentication
    await sequelize.authenticate(); // Ensure database connection for every request
    req.app = app; // Attach the Express app to the request
    app(req, res); // Forward the request to your Express app
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).send("Internal Server Error");
  }
};
