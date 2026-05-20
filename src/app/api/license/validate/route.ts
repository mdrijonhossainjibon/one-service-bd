import { NextRequest, NextResponse } from "next/server"
import { validateLicenseKey } from "@/lib/db"
import { isMaintenanceMode } from "@/lib/maintenance"

export async function POST(req: NextRequest) {
  try {
    if (await isMaintenanceMode()) {
      return NextResponse.json(
        { valid: false, error: "maintenance", message: "Service is currently under maintenance. Please try again later." },
        { status: 503 },
      )
    }

    const body = await req.json()
    const { key, hwid, ipAddress } = body

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { valid: false, error: "missing_key", message: "License key is required" },
        { status: 400 },
      )
    }

    const result = await validateLicenseKey(key, hwid, ipAddress)

    if (!result.valid) {
      const status =
        result.error === "not_found" ? 404
        : result.error === "expired" ? 410
        : result.error === "revoked" ? 403
        : result.error === "hwid_mismatch" || result.error === "ip_mismatch" ? 409
        : 400

      return NextResponse.json(result, { status })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    console.error("POST /api/license/validate error:", err)
    return NextResponse.json(
      { valid: false, error: "server_error", message: "Internal server error" },
      { status: 500 },
    )
  }
}
