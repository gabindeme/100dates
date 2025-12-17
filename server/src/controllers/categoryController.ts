import { Request, Response } from "express";
import { Category } from "../models/categoryModel.js";
import { createLog } from "./logController.js";
import { logLevels } from "../utils/enums/logLevels.js";

// Default categories to seed
const DEFAULT_CATEGORIES = [
    { name: "Romantique", color: "#ec4899", icon: "heart", isDefault: true },
    { name: "Aventure", color: "#f97316", icon: "mountain", isDefault: true },
    { name: "Culture", color: "#8b5cf6", icon: "book", isDefault: true },
    { name: "Gastronomie", color: "#eab308", icon: "utensils", isDefault: true },
    { name: "Sport", color: "#22c55e", icon: "dumbbell", isDefault: true },
    { name: "Détente", color: "#06b6d4", icon: "spa", isDefault: true },
];

/**
 * @function seedDefaultCategories
 * @description Seeds default categories if they don't exist
 */
export const seedDefaultCategories = async (): Promise<void> => {
    try {
        for (const cat of DEFAULT_CATEGORIES) {
            await Category.findOneAndUpdate(
                { name: cat.name },
                { $setOnInsert: cat },
                { upsert: true, new: true }
            );
        }
        console.log("Default categories seeded successfully");
    } catch (err: any) {
        console.error("Error seeding default categories:", err.message);
    }
};

/**
 * @function getCategories
 * @description Retrieves all categories sorted by name
 */
export const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await Category.find({}).sort({ isDefault: -1, name: 1 });
        res.status(200).json(categories);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @function createCategory
 * @description Creates a new category
 */
export const createCategory = async (req: Request, res: Response): Promise<void> => {
    const { name, color, icon } = req.body;

    if (!name) {
        res.status(400).json({ error: "server.global.errors.missing_fields" });
        return;
    }

    try {
        const existingCategory = await Category.findOne({ name: name.trim() });
        if (existingCategory) {
            res.status(400).json({ error: "server.categories.errors.already_exists" });
            return;
        }

        const category = await Category.create({
            name: name.trim(),
            color: color || "#6366f1",
            icon: icon || "",
            isDefault: false,
        });

        createLog({
            message: `Category '${name}' created successfully`,
            userId: req.userId,
            level: logLevels.INFO,
        });

        res.status(201).json(category);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @function updateCategory
 * @description Updates a category's details
 */
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, color, icon } = req.body;

    try {
        const category = await Category.findByIdAndUpdate(
            id,
            { name, color, icon },
            { new: true }
        );

        if (!category) {
            res.status(404).json({ error: "server.categories.errors.not_found" });
            return;
        }

        createLog({
            message: `Category '${category.name}' updated successfully`,
            userId: req.userId,
            level: logLevels.INFO,
        });

        res.status(200).json(category);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @function deleteCategory
 * @description Deletes a category (only if not default)
 */
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const category = await Category.findById(id);

        if (!category) {
            res.status(404).json({ error: "server.categories.errors.not_found" });
            return;
        }

        if (category.isDefault) {
            res.status(400).json({ error: "server.categories.errors.cannot_delete_default" });
            return;
        }

        await Category.findByIdAndDelete(id);

        createLog({
            message: `Category '${category.name}' deleted successfully`,
            userId: req.userId,
            level: logLevels.INFO,
        });

        res.status(200).json({ message: "server.categories.messages.deleted" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
