import { Request, Response } from "express";
import { Dates } from "../models/datesModel.js";
import { createLog } from "./logController.js";
import { logLevels } from "../utils/enums/logLevels.js";
import fs from "fs";
import path from "path";

/**
 * @function getDates
 * @description Retrieves all dates with pagination and filters.
 * @returns {Object} JSON response with a list of dates or error message.
 */
export const getDates = async (req: Request, res: Response): Promise<void> => {
  const size = parseInt(req.query.size as string) || 10;
  const page = parseInt(req.query.page as string) || 0;
  const category = req.query.category as string;
  const done = req.query.done as string;
  const sortBy = req.query.sortBy as string || "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

  try {
    // Build filter object - always filter by current user's ID
    const filter: any = { userId: req.userId };

    if (category && category !== "all") {
      filter.category = category;
    }

    if (done === "true") {
      filter.done = true;
    } else if (done === "false") {
      filter.done = false;
    }

    // Build sort object
    const sort: any = {};
    if (sortBy === "date_realised") {
      sort.date_realised = sortOrder;
    } else {
      sort.createdAt = sortOrder;
    }

    const dates = await Dates.find(filter)
      .sort(sort)
      .skip(page * size)
      .limit(size);

    const count = await Dates.countDocuments(filter);

    res.status(200).json({ dates, count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};


/**
 * @function createDate
 * @description Creates a new date activity.
 */
export const createDate = async (req: Request, res: Response): Promise<void> => {
  const { title, notes, category } = req.body;

  if (!title || !category) {
    res.status(400).json({ error: "server.global.errors.missing_fields" });
    return;
  }

  try {
    const date = await Dates.create({
      userId: req.userId,
      title,
      category,
      notes: notes || "",
      date_realised: null,
      done: false,
      images: []
    });

    createLog({
      message: `Date '${title}' created successfully`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(201).json(date);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function updateDate
 * @description Updates a date's details.
 */
export const updateDate = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // First verify the date belongs to the current user
    const existingDate = await Dates.findOne({ _id: id, userId: req.userId });
    if (!existingDate) {
      res.status(404).json({ error: "server.dates.errors.not_found" });
      return;
    }

    const date = await Dates.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );

    createLog({
      message: `Date '${date!.title}' updated successfully`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json(date);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function toggleDateDone
 * @description Toggles the done status of a date.
 */
export const toggleDateDone = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { done, date_realised } = req.body;

  try {
    // First verify the date belongs to the current user
    const existingDate = await Dates.findOne({ _id: id, userId: req.userId });
    if (!existingDate) {
      res.status(404).json({ error: "server.dates.errors.not_found" });
      return;
    }

    const updateData: any = { done };

    if (done === true) {
      updateData.date_realised = date_realised || new Date();
    } else {
      updateData.date_realised = null;
    }

    const date = await Dates.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    createLog({
      message: `Date '${date!.title}' marked as ${done ? "done" : "not done"}`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json(date);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function deleteDate
 * @description Deletes a date activity.
 */
export const deleteDate = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    // First verify the date belongs to the current user
    const existingDate = await Dates.findOne({ _id: id, userId: req.userId });
    if (!existingDate) {
      res.status(404).json({ error: "server.dates.errors.not_found" });
      return;
    }

    const date = await Dates.findByIdAndDelete(id);

    // Delete associated images
    if (date && date.images && date.images.length > 0) {
      date.images.forEach(imageUrl => {
        const filename = imageUrl.split("/").pop();
        if (filename) {
          const filePath = path.join(process.cwd(), "uploads", "dates", filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });
    }

    createLog({
      message: `Date '${date!.title}' deleted successfully`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ message: "server.dates.messages.deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function uploadDateImages
 * @description Uploads images for a date.
 */
export const uploadDateImages = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    res.status(400).json({ error: "server.upload.errors.no_files" });
    return;
  }

  try {
    // Verify the date belongs to the current user
    const date = await Dates.findOne({ _id: id, userId: req.userId });

    if (!date) {
      // Delete uploaded files if date not found or doesn't belong to user
      files.forEach(file => fs.unlinkSync(file.path));
      res.status(404).json({ error: "server.dates.errors.not_found" });
      return;
    }

    // Check max images limit
    const currentCount = date.images?.length || 0;
    if (currentCount + files.length > 5) {
      files.forEach(file => fs.unlinkSync(file.path));
      res.status(400).json({ error: "server.upload.errors.max_images" });
      return;
    }

    // Build image URLs
    const newImageUrls = files.map(file =>
      `${req.protocol}://${req.get("host")}/uploads/dates/${file.filename}`
    );

    date.images = [...(date.images || []), ...newImageUrls];
    await date.save();

    createLog({
      message: `${files.length} image(s) uploaded for date '${date.title}'`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ images: date.images, message: "server.upload.messages.images_success" });
  } catch (err: any) {
    files.forEach(file => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function deleteDateImage
 * @description Deletes a specific image from a date.
 */
export const deleteDateImage = async (req: Request, res: Response): Promise<void> => {
  const { id, filename } = req.params;

  try {
    // Verify the date belongs to the current user
    const date = await Dates.findOne({ _id: id, userId: req.userId });

    if (!date) {
      res.status(404).json({ error: "server.dates.errors.not_found" });
      return;
    }

    const imageUrl = date.images?.find(img => img.includes(filename));
    if (!imageUrl) {
      res.status(404).json({ error: "server.upload.errors.image_not_found" });
      return;
    }

    // Remove from database
    date.images = date.images.filter(img => !img.includes(filename));
    await date.save();

    // Delete file from disk
    const filePath = path.join(process.cwd(), "uploads", "dates", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    createLog({
      message: `Image '${filename}' deleted from date '${date.title}'`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ images: date.images, message: "server.upload.messages.image_deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};