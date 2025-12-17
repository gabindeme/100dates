import multer from "multer";
import { Request } from "express";
import path from "path";
import fs from "fs";

interface DateImageRequest extends Request {
    params: {
        id: string;
    };
}

// Ensure uploads directory exists
const uploadsDir = "./uploads/dates";
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration for Multer to handle date image uploads
const dateImagesStorage = multer.diskStorage({
    destination: (req: DateImageRequest, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, uploadsDir);
    },
    filename: (req: DateImageRequest, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const extension = path.extname(file.originalname);
        const dateId = req.params.id;
        cb(null, `date_${dateId}_${Date.now()}${extension}`);
    },
});

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
export const dateImagesUpload = multer({
    storage: dateImagesStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 3 * 1024 * 1024, // 3MB
        files: 5,
    },
});
