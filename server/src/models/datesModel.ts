import { Schema, model } from "mongoose";
import { IDates } from "../interfaces/IDates.js";

const DatesSchema = new Schema<IDates>(
  {
    title: { type: String, required: true, trim: true },
    notes: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    icon_path: { type: String, default: "" },
  },
  { timestamps: true },
);

DatesSchema.virtual("title").get(function (this: IDates) {
  const formattedTitle = this.title.charAt(0).toUpperCase() + this.title.slice(1).toLowerCase();
  return `${this.title} ${formattedTitle}`;
});

export const Dates = model<IDates>("User", DatesSchema);
