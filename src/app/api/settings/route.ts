import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Settings } from "@/models"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== "superadmin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  await connectDB()
  let settings = await Settings.findOne()
  if (!settings) {
    settings = await Settings.create({})
  }

  return NextResponse.json({
    appName: settings.appName,
    maxFailedAttempts: settings.maxFailedAttempts,
    sessionTimeout: settings.sessionTimeout,
    maintenanceMode: settings.maintenanceMode,
  })
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user as any)?.role !== "superadmin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const body = await req.json()
  await connectDB()

  let settings = await Settings.findOne()
  if (!settings) {
    settings = new Settings()
  }

  if (typeof body.appName === "string") settings.appName = body.appName
  if (typeof body.maxFailedAttempts === "number") settings.maxFailedAttempts = body.maxFailedAttempts
  if (typeof body.sessionTimeout === "number") settings.sessionTimeout = body.sessionTimeout
  if (typeof body.maintenanceMode === "boolean") settings.maintenanceMode = body.maintenanceMode

  await settings.save()

  return NextResponse.json({ success: true })
}
