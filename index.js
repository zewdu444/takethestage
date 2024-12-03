import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "./src/models/index.js";
import app from "./src/routes/route.js";

const PORT = process.env.PORT || 3002;

export default async (req, res) => {
  try {
    await sequelize.authenticate(); // Ensure database connection for every request
    req.app = app; // Attach the Express app to the request
    app(req, res); // Forward the request to your Express app
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).send("Internal Server Error");
  }
};
