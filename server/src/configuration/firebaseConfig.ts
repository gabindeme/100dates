import admin from "firebase-admin";

// Initialize Firebase Admin SDK
// This uses environment variables for the service account credentials
const initializeFirebase = () => {
    // Check if all required environment variables are present
    if (
        !process.env.FIREBASE_PROJECT_ID ||
        !process.env.FIREBASE_CLIENT_EMAIL ||
        !process.env.FIREBASE_PRIVATE_KEY ||
        !process.env.FIREBASE_STORAGE_BUCKET
    ) {
        console.warn(
            "Firebase Storage not configured. Image uploads will fail. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, and FIREBASE_STORAGE_BUCKET environment variables."
        );
        return null;
    }

    // Check if already initialized
    if (admin.apps.length === 0) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // The private key needs to have \n replaced with actual newlines
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
            }),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        });
    }

    return admin.storage().bucket();
};

export const storageBucket = initializeFirebase();

/**
 * Uploads a file buffer to Firebase Storage
 * @param buffer - The file buffer to upload
 * @param filename - The filename to use in storage
 * @param mimetype - The MIME type of the file
 * @param folder - The folder path in Firebase Storage (e.g., "dates" or "avatars")
 * @returns The public URL of the uploaded file
 */
export const uploadToFirebase = async (
    buffer: Buffer,
    filename: string,
    mimetype: string,
    folder: string
): Promise<string> => {
    if (!storageBucket) {
        throw new Error("Firebase Storage is not configured");
    }

    const filePath = `${folder}/${filename}`;
    const file = storageBucket.file(filePath);

    await file.save(buffer, {
        metadata: {
            contentType: mimetype,
        },
    });

    // Make the file publicly accessible
    await file.makePublic();

    // Return the public URL
    return `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/${filePath}`;
};

/**
 * Deletes a file from Firebase Storage
 * @param fileUrl - The full URL or path of the file to delete
 */
export const deleteFromFirebase = async (fileUrl: string): Promise<void> => {
    if (!storageBucket) {
        throw new Error("Firebase Storage is not configured");
    }

    // Extract the file path from the URL
    // URL format: https://storage.googleapis.com/bucket-name/folder/filename
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
    const urlPrefix = `https://storage.googleapis.com/${bucketName}/`;

    let filePath: string;
    if (fileUrl.startsWith(urlPrefix)) {
        filePath = fileUrl.replace(urlPrefix, "");
    } else {
        // If it's just a path, use it directly
        filePath = fileUrl;
    }

    try {
        await storageBucket.file(filePath).delete();
    } catch (error: any) {
        // Ignore "not found" errors - the file may have already been deleted
        if (error.code !== 404) {
            throw error;
        }
    }
};
