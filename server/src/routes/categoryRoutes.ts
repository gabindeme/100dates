import express, { Router } from "express";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../controllers/categoryController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

export const categoryRouter: Router = express.Router();

// All routes require authentication
categoryRouter.use(verifyToken());

// GET /api/categories - Get all categories
categoryRouter.get("/", getCategories);

// POST /api/categories - Create a new category
categoryRouter.post("/", createCategory);

// PUT /api/categories/:id - Update a category
categoryRouter.put("/:id", updateCategory);

// DELETE /api/categories/:id - Delete a category
categoryRouter.delete("/:id", deleteCategory);
