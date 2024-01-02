import { Schema, models, model, Document } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  name: string;
  username: string;
  email: string;
  password: string;
  bio?: string;
  picture?: string;
  location?: string;
  portfolio?: string;
  reputation: number;
  savedQuestions: Schema.Types.ObjectId[];
  joinedAt: Date;
}

const UserSchema = new Schema({
  clerkId: { type: String, required: true },
  name: { type: String, required: true },
  username: { type: String, required: true },
  email: {
    type: String,
    required: true,
    validate: {
      validator: (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: "Invalid email",
    },
  },
  password: { type: String, required: true },
  bio: { type: String },
  picture: { type: String },
  location: { type: String },
  portfolio: { type: String },
  reputation: { type: Number, default: 0 },
  savedQuestions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
  joinedAt: { type: Date, default: Date.now },
});

const User = models.User || model("User", UserSchema);

export default User;
