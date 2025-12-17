import mongoose, { Document } from "mongoose";

export interface ICategory extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    color: string;
    icon: string;
    isDefault: boolean;
}
