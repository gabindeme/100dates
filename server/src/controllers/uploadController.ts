import { Request, Response } from "express";
import { User } from "../models/userModel.js";
import { Constants } from "../constants/constants.js";
import { uploadToFirebase, deleteFromFirebase } from "../configuration/firebaseConfig.js";

/**
 * @function updateUserAvatar
 * @description Updates the avatar of a user by uploading a new file, validating the file type and size,
 * and replacing the old avatar if it exists.
 * @param {string} req.params.id - The ID of the user whose avatar is being updated.
 * @param {Object} req.file - The uploaded file containing the user's new avatar.
 * @returns {Object} JSON response with success or error message.
 */
export const updateUserAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id as string;
    const user = await User.findById(userId);

    if (!user) {
      res.status(400).json({ error: "server.global.errors.no_such_user" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "server.upload.errors.no_file" });
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      res.status(400).json({ error: "server.upload.errors.invalid_file_type" });
      return;
    }

    if (req.file.size > Constants.AVATAR_MAX_SIZE) {
      res.status(400).json({ error: `server.upload.errors.limit` });
      return;
    }

    // Delete old avatar from Firebase Storage if it exists
    if (user.avatar && user.avatar.includes("storage.googleapis.com")) {
      await deleteFromFirebase(user.avatar).catch(() => { });
    }

    // Upload new avatar to Firebase Storage
    const filename = `avatar_${userId}_${Date.now()}_${req.file.originalname}`;
    const newAvatarUrl = await uploadToFirebase(req.file.buffer, filename, req.file.mimetype, "avatars");

    user.avatar = newAvatarUrl;
    await user.save();

    res.status(200).json({
      message: "server.upload.messages.avatar_success",
      user,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
