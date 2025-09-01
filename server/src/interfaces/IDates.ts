import mongoose, { Document } from "mongoose";

export interface IDates extends Document {
  _id: mongoose.Types.ObjectId;
  id: number;
  title: string;
  date_realised: Date;
  done: boolean;
  notes: string;
  category: string;
  icon_path: string;
  image_path: string;
}