import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getUserById, getUsers, updateUserRole, banUser, deleteUser, createUser } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const users = await getUsers()
  // Strip passwords from response
  const safe = users.map(({ password, ...rest }) => rest)
  return NextResponse.json(safe)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()

  switch (body.action) {
    case "create": {
      const role = body.data.role

      // Only superadmin can create superadmin
      if (role === "superadmin" && session.user.role !== "superadmin") {
        return NextResponse.json({ error: "Only super admins can create super admin users" }, { status: 403 })
      }

      const user = await createUser(body.data)
      const { password, ...safe } = user
      return NextResponse.json(safe)
    }
    case "updateRole": {
      // Only superadmin can assign superadmin role
      if (body.role === "superadmin" && session.user.role !== "superadmin") {
        return NextResponse.json({ error: "Only super admins can assign the super admin role" }, { status: 403 })
      }

      await updateUserRole(body.userId, body.role)
      return NextResponse.json({ ok: true })
    }
    case "ban": {
      // Only superadmin can ban superadmin
      const target = await getUserById(body.userId)
      if (target?.role === "superadmin" && session.user.role !== "superadmin") {
        return NextResponse.json({ error: "Only super admins can ban super admin users" }, { status: 403 })
      }

      await banUser(body.userId)
      return NextResponse.json({ ok: true })
    }
    case "delete": {
      const targetUser = await getUserById(body.userId)
      if (targetUser?.role === "superadmin" && session.user.role !== "superadmin") {
        return NextResponse.json({ error: "Only super admins can delete super admin users" }, { status: 403 })
      }

      await deleteUser(body.userId)
      return NextResponse.json({ ok: true })
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  }
}
