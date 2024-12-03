import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const uploadPath = path.join(__dirname, "..", "news");
      console.log(uploadPath, "path");

      if (!fs.existsSync(uploadPath)) {
        await fs.promises.mkdir(uploadPath, { recursive: true }); // Create folder if it doesn't exist
      }

      cb(null, uploadPath);
    } catch (error) {
      console.error("Error creating directory:", error);
      return cb(new Error("Directory creation error"), false); // Pass error to multer
    }
  },
  filename: (req, file, cb) => {
    const newFileName = `${Date.now()}-${file.originalname}`;
    cb(null, newFileName); // Save file with this name
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error("Only .jpeg, .png, and .gif formats are allowed!");
    error.statusCode = 400; // Set a status code for the error
    return cb(error, false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter,
});

export default upload;
