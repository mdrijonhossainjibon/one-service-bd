import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  getLicenseKeys,
  createLicenseKey,
  updateLicenseKey,
  assignLicenseKey,
  revokeLicenseKey,
  resetLicenseKey,
  deleteLicenseKey,
  getUsers,
} from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const licenses = await getLicenseKeys()
  return NextResponse.json(licenses)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()

  switch (body.action) {
    case "edit": {
      await updateLicenseKey(body.data.id, body.data)
      return NextResponse.json({ ok: true })
    }
    case "create": {
      const created = await createLicenseKey(body.data)
      return NextResponse.json(created)
    }
    case "assign": {
      const users = await getUsers()
      const user = users.find((u) => body.userId === u.name || body.userId === u.email)
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
      await assignLicenseKey(body.keyId, user.id)
      return NextResponse.json({ ok: true })
    }
    case "revoke": {
      await revokeLicenseKey(body.keyId)
      return NextResponse.json({ ok: true })
    }
    case "reset": {
      await resetLicenseKey(body.keyId, body.newKey)
      return NextResponse.json({ ok: true })
    }
    case "delete": {
      await deleteLicenseKey(body.keyId)
      return NextResponse.json({ ok: true })
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  }
}
