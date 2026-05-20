"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { hasPermission, type UserRole } from "@/lib/roles"

type License = {
  id: string
  key: string
  assignedTo: string
  plan: string
  status: string
  expires: string
  hwid?: string
  ipAddress?: string
}

type ModalState = {
  open: boolean
  mode: "create" | "edit" | "delete" | "reset"
  license?: License
}

const ITEMS_PER_PAGE = 5

function generateKey() {
  const c = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const s: string[] = []
  for (let i = 0; i < 4; i++) {
    let g = ""
    for (let j = 0; j < 4; j++) g += c[Math.floor(Math.random() * c.length)]
    s.push(g)
  }
  return s.join("-")
}

function maskKey(k: string) {
  const p = k.split("-")
  return p[0] + "-" + p[1] + "-****-****"
}

export default function LicensesClient({ initialLicenses }: { initialLicenses: License[] }) {
  const { data: session } = useSession()
  const [licenses, setLicenses] = useState<License[]>(initialLicenses)
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<ModalState>({ open: false, mode: "create" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userSearch, setUserSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState("")
  const [plans, setPlans] = useState<{ _id: string; name: string; price: number }[]>([])

  const filtered = licenses.filter(
    (l) =>
      l.key.toLowerCase().includes(search.toLowerCase()) ||
      l.assignedTo.toLowerCase().includes(search.toLowerCase()) ||
      l.plan.toLowerCase().includes(search.toLowerCase()) ||
      l.status.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const refreshLicenses = useCallback(async () => {
    try {
      const res = await fetch("/api/licenses")
      if (res.ok) {
        const data = await res.json()
        setLicenses(data)
      }
    } catch {
      // fallback
    }
  }, [])

  useEffect(() => {
    refreshLicenses()
    fetch("/api/users")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setUsers(data))
      .catch(() => {})
    fetch("/api/plans")
      .then((r) => r.ok ? r.json() : { plans: [] })
      .then((data) => setPlans(data.plans || []))
      .catch(() => {})
  }, [refreshLicenses])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    const form = new FormData(e.currentTarget)
    const assignedTo = form.get("assignedTo") as string
    const plan = form.get("plan") as string
    const duration = parseInt(form.get("duration") as string)

    if (!assignedTo) {
      setError("Assigned To is required")
      return
    }

    const now = new Date()
    const expiresAt =
      duration === 0
        ? new Date("2100-01-01")
        : new Date(now.getTime() + duration * 86400000)

    setLoading(true)
    try {
      const res = await fetch("/api/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          data: {
            key: generateKey(),
            plan,
            expiresAt: expiresAt.toISOString(),
            assignedTo: selectedUser,
          },
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Failed to create license")
        return
      }

      await refreshLicenses()
      setModal({ open: false, mode: "create" })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    const form = new FormData(e.currentTarget)
    const lic = modal.license
    if (!lic) return

    const updates: Record<string, string> = {}
    const assignedTo = form.get("assignedTo") as string
    const plan = form.get("plan") as string
    const status = form.get("status") as string
    const expires = form.get("expires") as string

    if (assignedTo !== lic.assignedTo) updates.assignedTo = assignedTo
    if (plan !== lic.plan) updates.plan = plan
    if (status !== lic.status) updates.status = status
    if (expires !== lic.expires) updates.expires = expires || "Never"

    if (Object.keys(updates).length === 0) {
      setModal({ open: false, mode: "edit" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/licenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "edit", data: { id: lic.id, ...updates } }),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Failed to update license")
        return
      }

      await refreshLicenses()
      setModal({ open: false, mode: "edit" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    const lic = modal.license
    if (!lic) return

    setLoading(true)
    try {
      const res = await fetch(`/api/licenses/${lic.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: generateKey() }),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Failed to reset license key")
        return
      }

      await refreshLicenses()
      setModal({ open: false, mode: "reset" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const lic = modal.license
    if (!lic) return

    setLoading(true)
    try {
      const res = await fetch(`/api/licenses/${lic.id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Failed to delete license")
        return
      }

      await refreshLicenses()
      setModal({ open: false, mode: "delete" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-xl text-[#1F2028]">License Keys</h1>
          <p className="text-sm text-surface-400 mt-0.5">Manage software license keys</p>
        </div>
        {hasPermission((session?.user?.role as UserRole) ?? "user", "admin") && (
          <button
            onClick={() => setModal({ open: true, mode: "create" })}
            className="btn btn-primary"
          >
            + Create License Key
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
          placeholder="Search keys or users..."
          className="form-input pl-10 pr-4"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>License Key</th>
                <th>HWID</th>
                <th>IP Address</th>
                <th>Assigned To</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Expires</th>
                {hasPermission((session?.user?.role as UserRole) ?? "user", "admin") && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginated.map((lic) => (
                <tr key={lic.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-surface-300"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                      <span className="font-mono text-sm font-medium text-[#1F2028]">{maskKey(lic.key)}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(lic.key)
                          // toast handled by browser
                        }}
                        className="text-surface-300 hover:text-brand-500 transition-colors bg-transparent border-none cursor-pointer p-0"
                        title="Copy full key"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-xs text-surface-400" title={lic.hwid}>
                      {lic.hwid ? lic.hwid.slice(0, 16) + "..." : <span className="text-surface-300 italic">—</span>}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono text-xs text-surface-400">
                      {lic.ipAddress ? lic.ipAddress : <span className="text-surface-300 italic">—</span>}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <span className="avatar-sm">{lic.assignedTo ? lic.assignedTo.charAt(0).toUpperCase() : "?"}</span>
                      <span className="text-sm text-[#1F2028]">{lic.assignedTo || "Unassigned"}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      (() => {
                        const p = plans.find((pl) => pl.name === lic.plan)
                        if (!p) return "bg-surface-100 text-surface-600"
                        const colors = ["bg-brand-50 text-brand-700", "bg-sky-50 text-sky-700", "bg-amber-50 text-amber-700", "bg-rose-50 text-rose-700", "bg-emerald-50 text-emerald-700", "bg-violet-50 text-violet-700"]
                        return colors[plans.indexOf(p) % colors.length]
                      })()
                    }`}>{lic.plan}</span>
                  </td>
                  <td>
                    <span className={`badge ${
                      lic.status === "active" ? "badge-active" :
                      lic.status === "expired" ? "badge-expired" :
                      lic.status === "revoked" ? "badge-revoked" : "badge-inactive"
                    }`}>
                      {lic.status.charAt(0).toUpperCase() + lic.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm text-surface-400">{lic.expires === "2100-01-01" ? "Never" : lic.expires}</span>
                  </td>
                  {hasPermission((session?.user?.role as UserRole) ?? "user", "admin") && (
                    <td className="text-right">
                      <div className="actions-cell">
                        <button
                          className="action-btn action-btn-edit"
                          onClick={() => { setModal({ open: true, mode: "edit", license: lic }); setSelectedUser(""); setUserSearch("") }}
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </button>
                        {lic.status === "active" && (
                          <button
                            className="action-btn action-btn-reset"
                            onClick={() => setModal({ open: true, mode: "reset", license: lic })}
                            title="Reset"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                          </button>
                        )}
                        <button
                          className="action-btn action-btn-delete"
                          onClick={() => setModal({ open: true, mode: "delete", license: lic })}
                          title="Delete"
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
                  <td colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-surface-200 mb-4">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      <p className="text-sm font-medium text-surface-400 mb-1">No licenses found</p>
                      <p className="text-xs text-surface-300">Create a new license key to get started</p>
                    </div>
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

      {/* Create Modal */}
      {modal.mode === "create" && modal.open && (
        <div className="modal-overlay open" onClick={() => setModal({ open: false, mode: "create" })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-surface-100">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg text-[#1F2028]">Create License Key</h3>
                <button className="btn-ghost btn-icon" onClick={() => setModal({ open: false, mode: "create" })}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-surface-400"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleCreate}>
              <div className="p-6 space-y-4">
                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-center gap-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>{error}</span>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-surface-600 mb-1.5">Assign To</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type to search or select a user..."
                      value={selectedUser || userSearch}
                      onFocus={() => !selectedUser && setUserSearch(" ")}
                      onChange={(e) => { setUserSearch(e.target.value); setSelectedUser("") }}
                      className="form-input !pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedUser) { setSelectedUser(""); setUserSearch(" "); return }
                        setUserSearch(userSearch ? "" : " ")
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-300 hover:text-surface-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={selectedUser ? "M18 6 6 18M6 6l12 12" : userSearch ? "M18 6 6 18M6 6l12 12" : "M6 9l6 6 6-6"}/></svg>
                    </button>
                  </div>
                  {!selectedUser && (userSearch.length > 0 || userSearch === " ") && (
                    <div className="mt-1.5 max-h-40 overflow-y-auto border border-surface-200 rounded-lg divide-y divide-surface-100 bg-white shadow-sm">
                      {users
                        .filter((u) => u.name.toLowerCase().includes(userSearch.trim().toLowerCase()) || u.email.toLowerCase().includes(userSearch.trim().toLowerCase()))
                        .map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => { setSelectedUser(u.name); setUserSearch("") }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-brand-50 text-sm text-surface-700 text-left"
                          >
                            <span className="font-medium">{u.name}</span>
                            <span className="text-surface-400 text-xs">{u.email}</span>
                          </button>
                        ))}
                      {users.filter((u) => u.name.toLowerCase().includes(userSearch.trim().toLowerCase()) || u.email.toLowerCase().includes(userSearch.trim().toLowerCase())).length === 0 && (
                        <p className="px-3 py-2 text-sm text-surface-400 italic">No users found</p>
                      )}
                    </div>
                  )}
                  {/* hidden input for form submission */}
                  <input type="hidden" name="assignedTo" value={selectedUser} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-600 mb-1.5">Plan</label>
                  {plans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-surface-200 rounded-xl bg-surface-50/50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-surface-300 mb-3">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="12" y1="18" x2="12" y2="12"/>
                        <line x1="9" y1="15" x2="15" y2="15"/>
                      </svg>
                      <p className="text-sm font-medium text-surface-400 mb-1">No plans available</p>
                      <p className="text-xs text-surface-300">Create a plan first from the Plans page</p>
                    </div>
                  ) : (
                    <select name="plan" className="form-select" defaultValue={plans[0]?.name || "Pro"}>
                      {plans.map((p) => (
                        <option key={p._id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-600 mb-1.5">Duration</label>
                  <select name="duration" className="form-select" defaultValue="365">
                    <option value="30">30 Days</option>
                    <option value="90">90 Days</option>
                    <option value="365">1 Year</option>
                    <option value="0">Lifetime</option>
                  </select>
                </div>
              </div>
              <div className="p-6 border-t border-surface-100 flex justify-end gap-3">
                <button type="button" className="btn btn-outline" onClick={() => setModal({ open: false, mode: "create" })}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {modal.mode === "edit" && modal.open && (
        <div className="modal-overlay open" onClick={() => setModal({ open: false, mode: "edit" })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-surface-100">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg text-[#1F2028]">Edit License</h3>
                <button className="btn-ghost btn-icon" onClick={() => setModal({ open: false, mode: "edit" })}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-surface-400"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleEdit}>
              <div className="p-6 space-y-4">
                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-center gap-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>{error}</span>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-surface-600 mb-1.5">License Key (read-only)</label>
                  <input type="text" className="form-input font-mono !bg-surface-50 !cursor-not-allowed" value={modal.license?.key || ""} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-600 mb-1.5">Assigned To</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type to search or select a user..."
                      value={selectedUser || userSearch || (modal.mode === "edit" && !selectedUser ? modal.license?.assignedTo || "" : "")}
                      onFocus={() => !selectedUser && setUserSearch(" ")}
                      onChange={(e) => { setUserSearch(e.target.value); setSelectedUser("") }}
                      className="form-input !pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedUser) { setSelectedUser(""); setUserSearch(" "); return }
                        setUserSearch(userSearch ? "" : " ")
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-300 hover:text-surface-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={selectedUser ? "M18 6 6 18M6 6l12 12" : userSearch ? "M18 6 6 18M6 6l12 12" : "M6 9l6 6 6-6"}/></svg>
                    </button>
                  </div>
                  {!selectedUser && (userSearch.length > 0 || userSearch === " ") && (
                    <div className="mt-1.5 max-h-40 overflow-y-auto border border-surface-200 rounded-lg divide-y divide-surface-100 bg-white shadow-sm">
                      {users
                        .filter((u) => u.name.toLowerCase().includes(userSearch.trim().toLowerCase()) || u.email.toLowerCase().includes(userSearch.trim().toLowerCase()))
                        .map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => { setSelectedUser(u.name); setUserSearch("") }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-brand-50 text-sm text-surface-700 text-left"
                          >
                            <span className="font-medium">{u.name}</span>
                            <span className="text-surface-400 text-xs">{u.email}</span>
                          </button>
                        ))}
                      {users.filter((u) => u.name.toLowerCase().includes(userSearch.trim().toLowerCase()) || u.email.toLowerCase().includes(userSearch.trim().toLowerCase())).length === 0 && (
                        <p className="px-3 py-2 text-sm text-surface-400 italic">No users found</p>
                      )}
                    </div>
                  )}
                  <input type="hidden" name="assignedTo" value={selectedUser || modal.license?.assignedTo || ""} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-600 mb-1.5">Plan</label>
                  {plans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-surface-200 rounded-xl bg-surface-50/50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-surface-300 mb-2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="12" y1="18" x2="12" y2="12"/>
                        <line x1="9" y1="15" x2="15" y2="15"/>
                      </svg>
                      <p className="text-sm font-medium text-surface-400">No plans available</p>
                    </div>
                  ) : (
                    <select name="plan" className="form-select" defaultValue={modal.license?.plan || plans[0]?.name}>
                      {plans.map((p) => (
                        <option key={p._id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-600 mb-1.5">Status</label>
                  <select name="status" className="form-select" defaultValue={modal.license?.status || "active"}>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="revoked">Revoked</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-600 mb-1.5">Expires</label>
                  <input type="date" name="expires" className="form-input" defaultValue={modal.license?.expires === "Never" ? "" : modal.license?.expires || ""} />
                </div>
              </div>
              <div className="p-6 border-t border-surface-100 flex justify-end gap-3">
                <button type="button" className="btn btn-outline" onClick={() => setModal({ open: false, mode: "edit" })}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {modal.mode === "reset" && modal.open && (
        <div className="modal-overlay open" onClick={() => setModal({ open: false, mode: "reset" })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-surface-100">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg text-[#1F2028]">Reset License Key</h3>
                <button className="btn-ghost btn-icon" onClick={() => setModal({ open: false, mode: "reset" })}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-surface-400"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1F2028] mb-1">Reset this key?</p>
                  <p className="text-sm text-surface-400">A new key will be generated for this license.</p>
                </div>
              </div>
              <div className="bg-surface-50 rounded-lg p-3 mt-4 text-sm">
                <span className="text-surface-400">Current:</span>{" "}
                <span className="font-mono font-medium text-[#1F2028]">{modal.license ? maskKey(modal.license.key) : "—"}</span>
              </div>
            </div>
            <div className="p-6 border-t border-surface-100 flex justify-end gap-3">
              <button className="btn btn-outline" onClick={() => setModal({ open: false, mode: "reset" })}>Cancel</button>
              <button className="btn btn-primary" onClick={handleReset} disabled={loading}>
                {loading ? "Resetting..." : "Reset"}
              </button>
            </div>
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
                    License for <strong>{modal.license?.assignedTo}</strong> will be permanently deleted.
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
        .actions-cell { display: flex; gap: 6px; align-items: center; justify-content: flex-end; }
        .action-btn { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0; border-radius: 8px; border: 1px solid #E8E5DE; cursor: pointer; transition: all 0.2s; background: #fff; color: #9A9183; font-size: 13px; }
        .action-btn:active { transform: scale(0.9); }
        .action-btn:hover { border-color: #B8B1A5; color: #1F2028; background: #FAFAF8; }
        .action-btn-edit { color: #3B8FD9; border-color: rgba(59,143,217,0.2); }
        .action-btn-edit:hover { background: rgba(59,143,217,0.05); border-color: rgba(59,143,217,0.35); color: #3B8FD9; }
        .action-btn-reset { color: #C49A3C; border-color: rgba(196,154,60,0.2); }
        .action-btn-reset:hover { background: rgba(196,154,60,0.05); border-color: rgba(196,154,60,0.35); color: #C49A3C; }
        .action-btn-delete { color: #D94F4F; border-color: rgba(217,79,79,0.2); }
        .action-btn-delete:hover { background: rgba(217,79,79,0.05); border-color: rgba(217,79,79,0.35); color: #D94F4F; }
        .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
        .badge-active { background: rgba(45,159,111,0.1); color: #2D9F6F; }
        .badge-expired { background: rgba(229,164,60,0.1); color: #E5A43C; }
        .badge-revoked { background: rgba(154,145,131,0.1); color: #7D7364; }
        .badge-inactive { background: rgba(217,79,79,0.1); color: #D94F4F; }
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
