import { Schema, model } from "mongoose";
import { IDates } from "../interfaces/IDates.js";

const DatesSchema = new Schema<IDates>(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    notes: { type: String, default: "", trim: true },
    category: { type: String, required: true, trim: true },
    icon_path: { type: String, default: "" },
    image_path: { type: String, default: "" },
    done: { type: Boolean, default: false },
    date_realised: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Dates = model<IDates>("Dates", DatesSchema);
