import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "./src/models/index.js";
import app from "./src/routes/route.js";
const PORT = process.env.PORT || 3002;

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database & tables created!");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error creating database & tables:", error);
  });
