import https from "https";
import mongoose from "mongoose";
import { uploadToFirebase } from "../configuration/firebaseConfig.js";

/**
 * Downloads an image from a given URL and uploads it to Firebase Storage.
 * @param photoURL - The URL of the image to download.
 * @param userId - The ID of the user, used to create a unique filename.
 * @param extension - File extension/type, defaults to 'jpg'.
 * @returns Promise resolving to the Firebase Storage URL of the saved image.
 */
export const saveAvatarFromUrl = (photoURL: string, userId: mongoose.Types.ObjectId, extension: string = "jpg"): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      new URL(photoURL);
    } catch {
      return reject(new Error("Invalid URL"));
    }

    https
      .get(photoURL, (response) => {
        if (response.statusCode !== 200) {
          return reject(new Error(`Failed to get image, status code: ${response.statusCode}`));
        }

        const chunks: Buffer[] = [];

        response.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });

        response.on("end", async () => {
          try {
            const buffer = Buffer.concat(chunks);
            const filename = `avatar_${userId.toString()}_${Date.now()}.${extension}`;
            const mimetype = extension === "png" ? "image/png" : "image/jpeg";

            const avatarUrl = await uploadToFirebase(buffer, filename, mimetype, "avatars");
            resolve(avatarUrl);
          } catch (err) {
            reject(err);
          }
        });

        response.on("error", (err) => {
          reject(err);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};
