import { Request, Response } from "express";
import { Dates } from "../models/datesModel.js";
import bcrypt from "bcryptjs";
import { userRoles } from "../utils/enums/userRoles.js";
import { createLog } from "./logController.js";
import fs from "fs";
import path from "path";
import { generateRandomPassword } from "../utils/generateRandomPassword.js";
import { authTypes } from "../utils/enums/authTypes.js";
import { generateRandomAvatar } from "../utils/generateRandomAvatar.js";
import { logLevels } from "../utils/enums/logLevels.js";
import { Constants } from "../constants/constants.js";

/**
 * @function getDates
 * @description Retrieves all dates alphabeticaly sorted.
 * @returns {Object} JSON response with a list of dates or error message.
 */
export const getDates = async (req: Request, res: Response): Promise<void> => {
  const size = parseInt(req.query.size as string);
  const page = parseInt(req.query.page as string);

  try {
    const dates = await Dates.find({})
      .sort({ createdAt: -1 })
      .skip(page * size)
      .limit(size);

    const count = await Dates.countDocuments();

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
  const { title, category, icon_path } = req.body;

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
      icon_path,
      date_realised: null,
      done: false,
      notes: "",
      image_of_the_date_path: null
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
      {
        ...req.body,
      },
      { new: true }
    );

    if (!date) {
      res.status(404).json({ error: "server.global.errors.no_such_date" });
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
 * @function deleteDate
 * @description Deletes a date activity.
 */
export const deleteDate = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const date = await Dates.findOneAndDelete({ id: parseInt(id) });
    
    if (!date) {
      res.status(404).json({ error: "server.global.errors.no_such_date" });
      return;
    }

    createLog({
      message: `Date '${date.title}' deleted successfully`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ message: "server.dates.messages.date_deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};