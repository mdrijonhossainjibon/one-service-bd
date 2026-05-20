import mongoose, { model, models, Schema, Document } from "mongoose"

export interface ISettings extends Document {
  appName: string
  maxFailedAttempts: number
  sessionTimeout: number
  maintenanceMode: boolean
}

const SettingsSchema = new Schema<ISettings>({
  appName: { type: String, default: "License Manager" },
  maxFailedAttempts: { type: Number, default: 5 },
  sessionTimeout: { type: Number, default: 60 },
  maintenanceMode: { type: Boolean, default: false },
})

export const Settings =
  (models.Settings as mongoose.Model<ISettings>) ||
  model<ISettings>("Settings", SettingsSchema)
