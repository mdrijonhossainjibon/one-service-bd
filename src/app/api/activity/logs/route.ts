import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { ActivityLog } from "@/models"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")
  const search = searchParams.get("search")
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)))
  const skip = (page - 1) * limit

  await connectDB()

  const filter: Record<string, unknown> = {}
  if (type && type !== "all") filter.type = type
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    filter.$or = [
      { action: { $regex: escaped, $options: "i" } },
      { user: { $regex: escaped, $options: "i" } },
      { details: { $regex: escaped, $options: "i" } },
    ]
  }

  const [total, logs] = await Promise.all([
    ActivityLog.countDocuments(filter),
    ActivityLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
  ])

  return NextResponse.json({
    logs: logs.map((l) => ({
      id: l._id.toString(),
      user: l.user,
      action: l.action,
      details: l.details,
      type: l.type,
      timestamp: l.createdAt.toISOString(),
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  })
}
