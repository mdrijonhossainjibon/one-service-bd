import mongoose, { Schema, Document, Model } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  password: string
  avatar: string
  role: "superadmin" | "admin" | "user"
  status: "active" | "banned"
  hwid: string
  ipAddress: string
  joinedAt: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "" },
    role: { type: String, enum: ["superadmin", "admin", "user"], default: "user" },
    status: { type: String, enum: ["active", "banned"], default: "active" },
    hwid: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

UserSchema.index({ role: 1 })
UserSchema.index({ status: 1 })
UserSchema.index({ hwid: 1 })

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema)
