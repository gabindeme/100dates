import mongoose, { Document } from "mongoose";

export interface IDates extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  date_realised: Date;
  done: boolean;
  notes: string;
  category: string;
  images: string[];
}