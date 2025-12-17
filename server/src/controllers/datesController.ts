import { Request, Response } from "express";
import { Dates } from "../models/datesModel.js";
import { createLog } from "./logController.js";
import { logLevels } from "../utils/enums/logLevels.js";

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
    // Build filter object
    const filter: any = {};

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
  const { title, notes, category, icon_path } = req.body;

  if (!title || !category) {
    res.status(400).json({ error: "server.global.errors.missing_fields" });
    return;
  }

  try {
    // Get the highest id to increment
    const highestId = await Dates.findOne().sort({ id: -1 });
    const nextId = highestId ? highestId.id + 1 : 1;

    const date = await Dates.create({
      id: nextId,
      title,
      category,
      notes: notes || "",
      icon_path: icon_path || "",
      date_realised: null,
      done: false,
      image_path: ""
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
    const date = await Dates.findOneAndUpdate(
      { id: parseInt(id) },
      { ...req.body },
      { new: true }
    );

    if (!date) {
      res.status(404).json({ error: "server.dates.errors.not_found" });
      return;
    }

    createLog({
      message: `Date '${date.title}' updated successfully`,
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
    const updateData: any = { done };

    if (done === true) {
      updateData.date_realised = date_realised || new Date();
    } else {
      updateData.date_realised = null;
    }

    const date = await Dates.findOneAndUpdate(
      { id: parseInt(id) },
      updateData,
      { new: true }
    );

    if (!date) {
      res.status(404).json({ error: "server.dates.errors.not_found" });
      return;
    }

    createLog({
      message: `Date '${date.title}' marked as ${done ? "done" : "not done"}`,
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
    const date = await Dates.findOneAndDelete({ id: parseInt(id) });

    if (!date) {
      res.status(404).json({ error: "server.dates.errors.not_found" });
      return;
    }

    createLog({
      message: `Date '${date.title}' deleted successfully`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ message: "server.dates.messages.deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};