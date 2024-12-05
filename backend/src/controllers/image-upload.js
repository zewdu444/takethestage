import multer, { diskStorage } from 'multer';
import { join, dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const storage = diskStorage({
    destination: (req, file, cb) => {
        try {
            const id = req.user.id.toString(); // Ensure studentId is a string
            const uploadPath = join(
                __dirname,
                "..",
                "..",
                "profile",
                id
            );
            if (!existsSync(uploadPath)) {
                mkdirSync(uploadPath, { recursive: true }); // Create folder if it doesn't exist
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
