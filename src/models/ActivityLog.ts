import mongoose, { Schema, Document, Model } from "mongoose"

export interface IActivityLog extends Document {
  user: string
  action: string
  details: string
  type: "info" | "warning" | "error" | "success"
  createdAt: Date
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    user: { type: String, required: true, trim: true },
    action: { type: String, required: true, trim: true },
    details: { type: String, default: "" },
    type: {
      type: String,
      enum: ["info", "warning", "error", "success"],
      default: "info",
    },
  },
  { timestamps: true }
)

ActivityLogSchema.index({ createdAt: -1 })
ActivityLogSchema.index({ type: 1 })
ActivityLogSchema.index({ user: 1 })

export const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog ?? mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema)
