import { requireRole } from "@/lib/auth-utils"
import { getUsers } from "@/lib/db"
import UsersClient from "./client"

export default async function UsersPage() {
  await requireRole("admin")
  const raw = await getUsers()

  const initialUsers = raw.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
  }))

  return <UsersClient initialUsers={initialUsers} />
}
