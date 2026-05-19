import mongoose, { Schema, Document, Model } from "mongoose"

export interface ILicenseKey extends Document {
  key: string
  plan: "Basic" | "Pro" | "Enterprise"
  status: "active" | "expired" | "revoked" | "used"
  userId: mongoose.Types.ObjectId | null
  assignedTo: string | null
  hwid: string
  ipAddress: string
  issuedAt: Date
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

const LicenseKeySchema = new Schema<ILicenseKey>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    plan: {
      type: String,
      enum: ["Basic", "Pro", "Enterprise"],
      default: "Basic",
    },
    status: {
      type: String,
      enum: ["active", "expired", "revoked", "used"],
      default: "active",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedTo: { type: String, default: null },
    hwid: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    issuedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
)

LicenseKeySchema.index({ userId: 1 })
LicenseKeySchema.index({ status: 1 })
LicenseKeySchema.index({ expiresAt: 1 })
LicenseKeySchema.index({ hwid: 1 })

export const LicenseKey: Model<ILicenseKey> =
  mongoose.models.LicenseKey ?? mongoose.model<ILicenseKey>("LicenseKey", LicenseKeySchema)
