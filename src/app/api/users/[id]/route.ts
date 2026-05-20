import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getUserById, updateUser, deleteUser } from "@/lib/db"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const user = await getUserById(id)
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const { password, ...safe } = user
  return NextResponse.json(safe)
}

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

  // Only superadmin can set role to superadmin
  if (body.role === "superadmin" && session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Only super admins can assign the super admin role" }, { status: 403 })
  }

  try {
    await updateUser(id, body)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(`PATCH /api/users/${id} error:`, err)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
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

  // Check if target user is superadmin
  const target = await getUserById(id)
  if (target?.role === "superadmin" && session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Only super admins can delete super admin users" }, { status: 403 })
  }

  try {
    await deleteUser(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(`DELETE /api/users/${id} error:`, err)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
