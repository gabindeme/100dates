import multer from "multer";
import { Request } from "express";

// File filter for images only
const imageFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("server.upload.errors.invalid_file_type"));
    }
};

// Middleware Multer to handle date image uploads (max 5 files, 3MB each)
// Using memory storage for Firebase Storage uploads
export const dateImagesUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 3 * 1024 * 1024, // 3MB
        files: 5,
    },
});
