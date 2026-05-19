import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { deleteUser } from "@/lib/db"

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
    await deleteUser(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(`DELETE /api/users/${id} error:`, err)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
