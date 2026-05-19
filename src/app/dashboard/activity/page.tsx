"use client"

import { useState } from "react"


type LogEntry = {
  id: string
  action: string
  user: string
  type: "success" | "warning" | "error" | "info"
  timestamp: string
  details: string
}

const initialLogs: LogEntry[] = [
  { id: "1", action: "User created", user: "Admin", type: "success", timestamp: "2025-06-15 09:23:15", details: "New user John Doe was created" },
  { id: "2", action: "License generated", user: "Admin", type: "success", timestamp: "2025-06-15 09:20:00", details: "License key ABCD-1234-EFGH-5678 was generated" },
  { id: "3", action: "License revoked", user: "Admin", type: "warning", timestamp: "2025-06-15 08:45:30", details: "License for Jane Smith was revoked" },
  { id: "4", action: "Failed login attempt", user: "unknown", type: "error", timestamp: "2025-06-15 08:30:00", details: "Failed login attempt from IP 192.168.1.100" },
  { id: "5", action: "User banned", user: "Admin", type: "warning", timestamp: "2025-06-14 17:00:00", details: "User Bob Wilson was banned" },
  { id: "6", action: "License assigned", user: "Admin", type: "success", timestamp: "2025-06-14 16:22:10", details: "License key QRST-7890-UVWX-1234 assigned to Alice Brown" },
  { id: "7", action: "Settings updated", user: "Admin", type: "info", timestamp: "2025-06-14 15:00:00", details: "Max failed attempts changed from 3 to 5" },
  { id: "8", action: "User deleted", user: "Admin", type: "error", timestamp: "2025-06-14 14:30:00", details: "User Charlie Wilson was deleted" },
  { id: "9", action: "License expired", user: "System", type: "warning", timestamp: "2025-06-14 12:00:00", details: "License key IJKL-9012-MNOP-3456 has expired" },
  { id: "10", action: "User login", user: "John Doe", type: "info", timestamp: "2025-06-14 10:15:00", details: "User John Doe logged in from IP 192.168.1.50" },
  { id: "11", action: "License key reset", user: "Admin", type: "success", timestamp: "2025-06-14 09:00:00", details: "License key for Alice Brown was reset" },
  { id: "12", action: "User role changed", user: "Admin", type: "info", timestamp: "2025-06-13 16:45:00", details: "User Jane Smith role changed to admin" },
]

const typeIcons: Record<string, string> = {
  success: "✓",
  warning: "⚠",
  error: "✕",
  info: "ℹ",
}

const typeStyles: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  error: "bg-red-50 text-red-600",
  info: "bg-brand-50 text-brand-600",
}

export default function ActivityPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [search, setSearch] = useState("")

  const filtered = initialLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === "all" || log.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading font-bold text-xl text-[#1F2028]">Activity Log</h1>
        <p className="mt-1 text-sm text-surface-400">
          Track all actions and system events
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search activity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-surface-200 bg-white py-2.5 pl-10 pr-4 text-sm text-[#1F2028] placeholder-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-surface-200 bg-white px-3 py-2.5 text-sm text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="all">All Types</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
          <option value="info">Info</option>
        </select>
      </div>

      {/* Activity list */}
      <div className="space-y-2">
        {filtered.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-4 card p-4 transition hover:shadow-md"
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${typeStyles[log.type]}`}
            >
              {typeIcons[log.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[#1F2028]">{log.action}</p>
                <span className="text-xs text-surface-400">by {log.user}</span>
              </div>
              <p className="mt-0.5 text-sm text-surface-500">{log.details}</p>
            </div>
            <div className="shrink-0 text-xs text-surface-400">{log.timestamp}</div>
          </div>
        ))}
      </div>

      <style>{`
        .card { background: #fff; border-radius: 14px; border: 1px solid #E8E5DE; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
      `}</style>
    </div>
  )
}
