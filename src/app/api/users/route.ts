import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getUsers, updateUserRole, banUser, deleteUser, createUser } from "@/lib/db"

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
      const user = await createUser(body.data)
      const { password, ...safe } = user
      return NextResponse.json(safe)
    }
    case "updateRole": {
      await updateUserRole(body.userId, body.role)
      return NextResponse.json({ ok: true })
    }
    case "ban": {
      await banUser(body.userId)
      return NextResponse.json({ ok: true })
    }
    case "delete": {
      await deleteUser(body.userId)
      return NextResponse.json({ ok: true })
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  }
}
