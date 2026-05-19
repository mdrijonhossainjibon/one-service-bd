import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  updateLicenseKey,
  resetLicenseKey,
  deleteLicenseKey,
} from "@/lib/db"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  try {
    if (body.key) {
      await resetLicenseKey(id, body.key)
      return NextResponse.json({ ok: true })
    }

    // default: update fields
    await updateLicenseKey(id, body)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(`PATCH /api/licenses/${id} error:`, err)
    return NextResponse.json({ error: "Failed to update license" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    await deleteLicenseKey(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(`DELETE /api/licenses/${id} error:`, err)
    return NextResponse.json({ error: "Failed to delete license" }, { status: 500 })
  }
}
