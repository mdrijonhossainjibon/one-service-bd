import mongoose, { Schema, type Document } from "mongoose"

export interface IPlanFeature {
  name: string
  value: string
}

export interface IPlan extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  price: number
  period: "monthly" | "yearly"
  description: string
  features: IPlanFeature[]
  popular: boolean
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const PlanFeatureSchema = new Schema<IPlanFeature>(
  {
    name: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
)

const PlanSchema = new Schema<IPlan>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    period: { type: String, enum: ["monthly", "yearly"], default: "monthly" },
    description: { type: String, default: "" },
    features: { type: [PlanFeatureSchema], default: [] },
    popular: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export const Plan = mongoose.models.Plan ?? mongoose.model<IPlan>("Plan", PlanSchema)
