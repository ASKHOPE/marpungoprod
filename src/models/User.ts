
import mongoose, { Schema, model, Document } from "mongoose";
import type { UserDocument as IUserDocumentType } from "@/types/db"; // For consistency with other types

// Re-define UserDocument here for Mongoose, ensuring it aligns with IUserDocumentType
export interface UserDocument extends IUserDocumentType, Document {}

const UserSchema = new Schema<UserDocument>({
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Email is invalid",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Important: Do not return password by default
    },
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    phone: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
      required: true,
    }
  },
  {
    timestamps: true, // This will add createdAt and updatedAt fields
  }
);

const User = mongoose.models?.User || model<UserDocument>('User', UserSchema);

export default User;
