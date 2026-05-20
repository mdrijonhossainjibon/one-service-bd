import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { ActivityLog } from "@/models"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  await connectDB()

  const log = await ActivityLog.findById(id).lean()
  if (!log) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 })
  }

  return NextResponse.json({
    id: log._id.toString(),
    user: log.user,
    action: log.action,
    details: log.details,
    type: log.type,
    timestamp: log.createdAt.toISOString(),
  })
}
