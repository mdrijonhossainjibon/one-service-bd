import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserById } from "@/lib/db"
import type { UserRole } from "@/lib/roles"

/**
 * Get the current user's role on the server side.
 * Redirects to /login if not authenticated.
 */
export async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }
  const user = await getUserById(session.user.id)
  if (!user) {
    redirect("/login")
  }
  return user
}

/**
 * Require a minimum role level. Redirects to /dashboard if unauthorized.
 */
export async function requireRole(minRole: UserRole) {
  const user = await requireAuth()
  const roleRank: Record<UserRole, number> = { user: 0, admin: 1, superadmin: 2 }

  if (roleRank[user.role] < roleRank[minRole]) {
    redirect("/dashboard")
  }

  return user
}

/**
 * Check if a role has sufficient permissions. Pure function, safe for client use.
 */
export function hasPermission(role: UserRole, minRole: UserRole): boolean {
  const roleRank: Record<UserRole, number> = { user: 0, admin: 1, superadmin: 2 }
  return roleRank[role] >= roleRank[minRole]
}
