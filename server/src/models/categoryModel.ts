import { Schema, model } from "mongoose";
import { ICategory } from "../interfaces/ICategory.js";

const CategorySchema = new Schema<ICategory>(
    {
        name: { type: String, required: true, trim: true, unique: true },
        color: { type: String, default: "#6366f1" },
        icon: { type: String, default: "" },
        isDefault: { type: Boolean, default: false },
    },
    { timestamps: true },
);

export const Category = model<ICategory>("Category", CategorySchema);
