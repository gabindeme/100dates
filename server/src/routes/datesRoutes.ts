import express, { Router } from "express";
import { getDates, createDate, updateDate, deleteDate, toggleDateDone } from "../controllers/datesController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

export const datesRouter: Router = express.Router();

// All routes require authentication
datesRouter.use(verifyToken());

// GET /api/dates - Get all dates with pagination and filters
datesRouter.get("/", getDates);

// POST /api/dates - Create a new date
datesRouter.post("/", createDate);

// PUT /api/dates/:id - Update a date
datesRouter.put("/:id", updateDate);

// PATCH /api/dates/:id/toggle - Toggle done status
datesRouter.patch("/:id/toggle", toggleDateDone);

// DELETE /api/dates/:id - Delete a date
datesRouter.delete("/:id", deleteDate);
