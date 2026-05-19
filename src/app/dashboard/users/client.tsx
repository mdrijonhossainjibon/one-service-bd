"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { hasPermission, type UserRole } from "@/lib/roles"

type User = {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
}

type ModalState = {
  open: boolean
  mode: "add" | "edit" | "delete" | "ban"
  user?: User
}

const ITEMS_PER_PAGE = 5

export default function UsersClient({ initialUsers }: { initialUsers: User[] }) {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<ModalState>({ open: false, mode: "add" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const refreshUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch {
      // fallback to initial
    }
  }, [])

  useEffect(() => {
    refreshUsers()
  }, [refreshUsers])

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    const form = new FormData(e.currentTarget)
    const name = form.get("name") as string
    const email = form.get("email") as string
    const role = form.get("role") as string
    const password = form.get("password") as string

    if (!name || !email || !password) {
      setError("Name, email, and password are required")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", data: { name, email, role, password } }),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Failed to create user")
        return
      }

      await refreshUsers()
      setModal({ open: false, mode: "add" })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    const form = new FormData(e.currentTarget)
    const user = modal.user
    if (!user) return

    const updates: Record<string, string> = {}
    const name = form.get("name") as string
    const email = form.get("email") as string
    const role = form.get("role") as string

    if (name !== user.name) updates.name = name
    if (email !== user.email) updates.email = email
    if (role !== user.role) updates.role = role

    if (Object.keys(updates).length === 0) {
      setModal({ open: false, mode: "edit" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Failed to update user")
        return
      }

      await refreshUsers()
      setModal({ open: false, mode: "edit" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const user = modal.user
    if (!user) return

    setLoading(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Failed to delete user")
        return
      }

      await refreshUsers()
      setModal({ open: false, mode: "delete" })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    const user = modal.user
    if (!user) return

    const newStatus = user.status === "active" ? "inactive" : "active"
    setLoading(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Failed to update user")
        return
      }

      await refreshUsers()
      setModal({ open: false, mode: "ban" })
    } finally {
      setLoading(false)
    }
  }

  const inlineSaveName = async (userId: string, name: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (res.ok) await refreshUsers()
    } catch {
      // ignore
    }
    setEditingId(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-xl text-[#1F2028]">User Management</h1>
          <p className="text-sm text-surface-400 mt-0.5">Manage team members and their roles</p>
        </div>
        {hasPermission((session?.user?.role as UserRole) ?? "user", "admin") && (
          <button
            onClick={() => setModal({ open: true, mode: "add" })}
            className="btn btn-primary"
          >
            + Add User
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-72">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-300"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search users..."
          className="form-input pl-10 pr-4"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                {hasPermission((session?.user?.role as UserRole) ?? "user", "admin") && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginated.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-xs">
                          {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        {editingId === user.id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={() => inlineSaveName(user.id, editName)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") inlineSaveName(user.id, editName)
                              if (e.key === "Escape") setEditingId(null)
                            }}
                            className="inline-edit-input"
                            autoFocus
                          />
                        ) : (
                          <div
                            className="text-sm font-medium text-[#1F2028] editable-name"
                            onClick={() => {
                              if (hasPermission((session?.user?.role as UserRole) ?? "user", "admin")) {
                                setEditingId(user.id)
                                setEditName(user.name)
                              }
                            }}
                            title="Click to edit name"
                          >
                            {user.name}
                          </div>
                        )}
                        <div className="text-xs text-surface-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      user.role === "Admin" ? "bg-brand-50 text-brand-700" :
                      user.role === "Editor" ? "bg-sky-50 text-sky-700" :
                      "bg-surface-100 text-surface-600"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.status === "active" ? "bg-emerald-500" : "bg-surface-300"}`} />
                      <span className={`badge ${user.status === "active" ? "badge-active" : "badge-inactive"}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="text-sm text-surface-400">
                      {new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </td>
                  {hasPermission((session?.user?.role as UserRole) ?? "user", "admin") && (
                    <td className="text-right">
                      <div className="actions-cell">
                        <button
                          className="action-btn action-btn-edit"
                          onClick={() => setModal({ open: true, mode: "edit", user })}
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </button>
                        {user.status === "active" ? (
                          <button
                            className="action-btn action-btn-ban"
                            onClick={() => setModal({ open: true, mode: "ban", user })}
                            title="Ban"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>
                          </button>
                        ) : (
                          <button
                            className="action-btn action-btn-activate"
                            onClick={() => setModal({ open: true, mode: "ban", user })}
                            title="Activate"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                          </button>
                        )}
                        <button
                          className="action-btn action-btn-delete"
                          onClick={() => setModal({ open: true, mode: "delete", user })}
                          title="Remove"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-surface-400 text-sm">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-surface-100">
          <span className="text-sm text-surface-400">
            Showing {filtered.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1}-
            {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`btn btn-sm ${page === i + 1 ? "btn-primary" : "btn-outline"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal.open && (modal.mode === "add" || modal.mode === "edit") && (
        <div className="modal-overlay open" onClick={() => setModal({ open: false, mode: "add" })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-surface-100">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg text-[#1F2028]">
                  {modal.mode === "add" ? "Add New User" : "Edit User"}
                </h3>
                <button className="btn-ghost btn-icon" onClick={() => setModal({ open: false, mode: "add" })}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-surface-400"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <form onSubmit={modal.mode === "add" ? handleAdd : handleEdit}>
              <div className="p-6 space-y-4">
                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-center gap-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>{error}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-600 mb-1.5">Full Name</label>
                    <input type="text" name="name" defaultValue={modal.user?.name || ""} className="form-input" placeholder="John Smith" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-600 mb-1.5">Email</label>
                    <input type="email" name="email" defaultValue={modal.user?.email || ""} className="form-input" placeholder="john@company.com" required />
                  </div>
                </div>
                {modal.mode === "add" && (
                  <div>
                    <label className="block text-sm font-medium text-surface-600 mb-1.5">Password</label>
                    <input type="password" name="password" className="form-input" placeholder="Min 8 characters" required />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-surface-600 mb-1.5">Role</label>
                  <select name="role" defaultValue={modal.user?.role || "user"} className="form-select">
                    <option value="superadmin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>
              </div>
              <div className="p-6 border-t border-surface-100 flex justify-end gap-3">
                <button type="button" className="btn btn-outline" onClick={() => setModal({ open: false, mode: "add" })}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : modal.mode === "add" ? "Add User" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal.mode === "delete" && modal.open && (
        <div className="modal-overlay open" onClick={() => setModal({ open: false, mode: "delete" })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-surface-100">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg text-rose-600">Confirm Deletion</h3>
                <button className="btn-ghost btn-icon" onClick={() => setModal({ open: false, mode: "delete" })}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-surface-400"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1F2028] mb-1">This cannot be undone.</p>
                  <p className="text-sm text-surface-400">
                    User <strong>{modal.user?.name}</strong> will be permanently removed.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-surface-100 flex justify-end gap-3">
              <button className="btn btn-outline" onClick={() => setModal({ open: false, mode: "delete" })}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban/Activate Modal */}
      {modal.mode === "ban" && modal.open && (
        <div className="modal-overlay open" onClick={() => setModal({ open: false, mode: "ban" })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-surface-100">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg text-[#1F2028]">
                  {modal.user?.status === "active" ? "Ban User" : "Activate User"}
                </h3>
                <button className="btn-ghost btn-icon" onClick={() => setModal({ open: false, mode: "ban" })}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-surface-400"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  modal.user?.status === "active" ? "bg-amber-50" : "bg-emerald-50"
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={modal.user?.status === "active" ? "text-amber-500" : "text-emerald-500"}>
                    {modal.user?.status === "active" ? (
                      <><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></>
                    ) : (
                      <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>
                    )}
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1F2028]">
                    {modal.user?.status === "active" ? `Ban ${modal.user?.name}?` : `Activate ${modal.user?.name}?`}
                  </p>
                  <p className="text-sm text-surface-400 mt-1">
                    {modal.user?.status === "active" ? "They will lose access immediately." : "They will regain access."}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-surface-100 flex justify-end gap-3">
              <button className="btn btn-outline" onClick={() => setModal({ open: false, mode: "ban" })}>Cancel</button>
              <button
                onClick={handleToggleStatus}
                disabled={loading}
                className={`btn ${
                  modal.user?.status === "active"
                    ? "btn-outline !text-amber-600 !border-amber-200 hover:!bg-amber-50"
                    : "btn-primary"
                }`}
              >
                {loading ? "Updating..." : modal.user?.status === "active" ? "Ban" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .card { background: #fff; border-radius: 14px; border: 1px solid #E8E5DE; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .data-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .data-table thead th { padding: 12px 16px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #9A9183; border-bottom: 1px solid #E8E5DE; background: #FAFAF8; text-align: left; }
        .data-table tbody td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid #E8E5DE; transition: background 0.15s; vertical-align: middle; }
        .data-table tbody tr:hover td { background: #FAFAF8; }
        .data-table tbody tr:last-child td { border-bottom: none; }
        .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; outline: none; font-family: var(--font-dm-sans); white-space: nowrap; }
        .btn:active { transform: scale(0.97); }
        .btn-primary { background: #C49A3C; color: #fff; }
        .btn-primary:hover { background: #D4A85B; box-shadow: 0 4px 14px rgba(196,154,60,0.35); }
        .btn-outline { background: transparent; color: #1F2028; border: 1.5px solid #E8E5DE; }
        .btn-outline:hover { border-color: #B8B1A5; background: #FAFAF8; }
        .btn-danger { background: #D94F4F; color: #fff; }
        .btn-danger:hover { background: #C44040; }
        .btn-ghost { background: transparent; color: #9A9183; padding: 8px 12px; }
        .btn-ghost:hover { background: #E8E5DE; color: #1F2028; }
        .btn-sm { padding: 6px 12px; font-size: 13px; border-radius: 8px; }
        .btn-icon { padding: 8px; width: 36px; height: 36px; justify-content: center; border-radius: 9px; }
        .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
        .badge-active { background: rgba(45,159,111,0.1); color: #2D9F6F; }
        .badge-inactive { background: rgba(217,79,79,0.1); color: #D94F4F; }
        .actions-cell { display: flex; gap: 6px; align-items: center; justify-content: flex-end; }
        .action-btn { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0; border-radius: 8px; border: 1px solid #E8E5DE; cursor: pointer; transition: all 0.2s; background: #fff; color: #9A9183; font-size: 13px; }
        .action-btn:active { transform: scale(0.9); }
        .action-btn:hover { border-color: #B8B1A5; color: #1F2028; background: #FAFAF8; }
        .action-btn-edit { color: #3B8FD9; border-color: rgba(59,143,217,0.2); }
        .action-btn-edit:hover { background: rgba(59,143,217,0.05); border-color: rgba(59,143,217,0.35); color: #3B8FD9; }
        .action-btn-ban { color: #E5A43C; border-color: rgba(229,164,60,0.2); }
        .action-btn-ban:hover { background: rgba(229,164,60,0.05); border-color: rgba(229,164,60,0.35); color: #E5A43C; }
        .action-btn-activate { color: #2D9F6F; border-color: rgba(45,159,111,0.2); }
        .action-btn-activate:hover { background: rgba(45,159,111,0.05); border-color: rgba(45,159,111,0.35); color: #2D9F6F; }
        .action-btn-delete { color: #D94F4F; border-color: rgba(217,79,79,0.2); }
        .action-btn-delete:hover { background: rgba(217,79,79,0.05); border-color: rgba(217,79,79,0.35); color: #D94F4F; }
        .editable-name { cursor: pointer; transition: all 0.2s; border-radius: 4px; padding: 1px 4px; margin: -1px -4px; }
        .editable-name:hover { background: #F0EDE7; }
        .inline-edit-input { padding: 2px 6px; border: 1.5px solid #C49A3C; border-radius: 6px; font-size: 14px; font-family: var(--font-dm-sans); outline: none; background: #fff; box-shadow: 0 0 0 3px rgba(196,154,60,0.15); }
        .form-input { width: 100%; padding: 10px 14px; border: 1.5px solid #E8E5DE; border-radius: 10px; font-size: 14px; font-family: var(--font-dm-sans); transition: all 0.2s; background: #FAFAF8; color: #1F2028; outline: none; }
        .form-input:focus { border-color: #C49A3C; box-shadow: 0 0 0 3px rgba(196,154,60,0.12); background: #fff; }
        .form-input::placeholder { color: #B8B1A5; }
        .form-select { width: 100%; padding: 10px 14px; border: 1.5px solid #E8E5DE; border-radius: 10px; font-size: 14px; font-family: var(--font-dm-sans); transition: all 0.2s; background: #FAFAF8; color: #1F2028; outline: none; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236E7085' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; }
        .form-select:focus { border-color: #C49A3C; box-shadow: 0 0 0 3px rgba(196,154,60,0.12); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
        .modal-content { background: #fff; border-radius: 18px; width: 90%; max-width: 500px; max-height: 85vh; overflow-y: auto; box-shadow: 0 25px 60px rgba(0,0,0,0.2); }
      `}</style>
    </div>
  )
}
