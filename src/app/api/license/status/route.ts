import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { LicenseKey } from "@/models"
import { isMaintenanceMode } from "@/lib/maintenance"

export async function GET() {
  try {
    if (await isMaintenanceMode()) {
      return NextResponse.json(
        { valid: false, error: "maintenance", message: "Service is currently under maintenance. Please try again later." },
        { status: 503 },
      )
    }
    return NextResponse.json({ error: "Method not allowed. Use POST with a license key." }, { status: 405 })
  } catch {
    return NextResponse.json({ error: "Method not allowed. Use POST with a license key." }, { status: 405 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (await isMaintenanceMode()) {
      return NextResponse.json(
        { valid: false, error: "maintenance", message: "Service is currently under maintenance. Please try again later." },
        { status: 503 },
      )
    }

    const body = await req.json()
    const { key } = body

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { valid: false, error: "missing_key", message: "License key is required" },
        { status: 400 },
      )
    }

    await connectDB()
    const license = await LicenseKey.findOne({ key }).select("key plan status expiresAt hwid ipAddress").lean()

    if (!license) {
      return NextResponse.json(
        { valid: false, status: "not_found", message: "License key not found" },
        { status: 200 },
      )
    }

    const expired = license.expiresAt < new Date()
    const currentStatus = expired ? "expired" : license.status

    // Auto-fix if expired but status still says active
    if (expired && license.status === "active") {
      await LicenseKey.findByIdAndUpdate(license._id, { status: "expired" })
    }

    const valid = currentStatus === "active"

    return NextResponse.json({
      valid,
      status: currentStatus,
      plan: license.plan,
      expiresAt: license.expiresAt.toISOString().split("T")[0],
      ...(valid ? {} : { message: currentStatus === "expired" ? "License key has expired" : "License key has been revoked" }),
    })
  } catch (err) {
    console.error("POST /api/license/status error:", err)
    const msg = err instanceof SyntaxError ? "Invalid JSON in request body" : "Internal server error"
    return NextResponse.json(
      { valid: false, error: "server_error", message: msg },
      { status: 500 },
    )
  }
}
