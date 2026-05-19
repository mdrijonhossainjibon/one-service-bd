export type UserRole = "superadmin" | "admin" | "user"

/**
 * Check if a role has sufficient permissions. Pure function, safe for client use.
 */
export function hasPermission(role: UserRole, minRole: UserRole): boolean {
  const roleRank: Record<UserRole, number> = { user: 0, admin: 1, superadmin: 2 }
  return roleRank[role] >= roleRank[minRole]
}
