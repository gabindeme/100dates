import multer from "multer";

// Middleware Multer to handle file uploads using memory storage for Firebase
export const uploadConfig = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max for avatars
  },
});
