import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Plan } from "@/models"

export async function GET() {
  await connectDB()
  const plans = await Plan.find({ active: true }).sort({ price: 1 }).lean()
  return NextResponse.json({ plans })
}

export async function POST(req: NextRequest) {
  await connectDB()
  const body = await req.json()

  const plan = await Plan.create({
    name: body.name,
    price: body.price,
    period: body.period ?? "monthly",
    description: body.description ?? "",
    features: body.features ?? [],
    popular: body.popular ?? false,
  })

  return NextResponse.json({ plan }, { status: 201 })
}
