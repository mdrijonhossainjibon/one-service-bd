import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Plan } from "@/models"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()
  const plan = await Plan.findById(id).lean()
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 })
  return NextResponse.json({ plan })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()
  const body = await req.json()

  const plan = await Plan.findByIdAndUpdate(
    id,
    {
      name: body.name,
      price: body.price,
      period: body.period,
      description: body.description,
      features: body.features,
      popular: body.popular,
      active: body.active,
    },
    { new: true },
  ).lean()

  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 })
  return NextResponse.json({ plan })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()
  const plan = await Plan.findByIdAndDelete(id).lean()
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
