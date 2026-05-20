"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"

type LogType = "success" | "warning" | "error" | "info"

type LogEntry = {
  id: string
  action: string
  user: string
  type: LogType
  timestamp: string
  details: string
}

type Pagination = {
  total: number
  page: number
  limit: number
  totalPages: number
}

const typeConfig: Record<LogType, { dot: string; bg: string; label: string; icon: React.ReactNode }> = {
  success: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    label: "Success",
    icon: (
      <svg className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  warning: {
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    label: "Warning",
    icon: (
      <svg className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
  },
  error: {
    dot: "bg-danger",
    bg: "bg-red-50 dark:bg-red-500/10",
    label: "Error",
    icon: (
      <svg className="h-3.5 w-3.5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  info: {
    dot: "bg-brand-500",
    bg: "bg-brand-50 dark:bg-brand-500/10",
    label: "Info",
    icon: (
      <svg className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return formatTime(iso)
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 0 })
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [loading, setLoading] = useState(true)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchLogs = useCallback(async (page: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter !== "all") params.set("type", typeFilter)
      if (debouncedSearch) params.set("search", debouncedSearch)
      params.set("page", String(page))
      params.set("limit", "20")

      const res = await fetch(`/api/activity/logs?${params}`)
      const data = await res.json()
      setLogs(data.logs)
      setPagination(data.pagination)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [typeFilter, debouncedSearch])

  // Fetch when filter or search changes — reset to page 1
  useEffect(() => {
    fetchLogs(1)
  }, [fetchLogs])

  const goToPage = (p: number) => {
    if (p < 1 || p > pagination.totalPages) return
    fetchLogs(p)
  }

  const totalActive = logs.length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-xl text-[#1F2028] dark:text-white">Activity Log</h1>
          <p className="text-sm text-surface-400 mt-0.5 dark:text-surface-300">
            Track all actions and system events
            {!loading && <span className="ml-1">— {pagination.total} total entries</span>}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 pointer-events-none"
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
            className="w-full rounded-lg border border-surface-200 bg-white py-2.5 pl-10 pr-4 text-sm text-[#1F2028] placeholder-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-panel-200 dark:bg-panel-300 dark:text-white dark:placeholder-surface-500"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "success", "warning", "error", "info"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                typeFilter === t
                  ? "bg-brand-500 text-white shadow-sm"
                  : "border border-surface-200 bg-white text-surface-500 hover:border-surface-300 dark:border-panel-200 dark:bg-panel-300 dark:text-surface-300 dark:hover:border-surface-500"
              }`}
            >
              {t === "all" ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              ) : (
                typeConfig[t].icon
              )}
              {t === "all" ? "All" : typeConfig[t].label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity list */}
      <div className="space-y-1.5">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-sm text-surface-400 dark:text-surface-300">
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading activity...
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-surface-400 dark:text-surface-500">
            <svg className="h-12 w-12 mb-4 text-surface-200 dark:text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <svg className="h-10 w-10 -mt-2 mb-3 text-surface-300 dark:text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-sm">No activity found</p>
          </div>
        ) : (
          logs.map((log, idx) => {
            const cfg = typeConfig[log.type]
            const isLast = idx === logs.length - 1
            return (
              <Link key={log.id} href={`/dashboard/activity/${log.id}`} className="group relative flex items-start gap-4 rounded-xl border border-surface-100 bg-white p-4 transition hover:border-surface-200 hover:shadow-sm dark:border-panel-200 dark:bg-panel-300 dark:hover:border-surface-500/30">
                {/* Timeline icon + line */}
                <div className="relative flex flex-col items-center pt-1">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-white ${cfg.bg} ${cfg.dot} bg-opacity-100 dark:ring-panel-300`}>
                    {cfg.icon}
                  </div>
                  {!isLast && (
                    <div className="mt-1 w-px flex-1 bg-surface-200 dark:bg-panel-100" style={{ minHeight: 16 }} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate text-sm font-semibold text-[#1F2028] dark:text-white">{log.action}</span>
                      <span className={`hidden xs:inline rounded-md px-1.5 py-0.5 text-[11px] font-medium ${cfg.bg} ${cfg.dot.replace("bg-", "text-")}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs text-surface-400 dark:text-surface-500">{timeAgo(log.timestamp)}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">
                    {log.details || <span className="italic">No details</span>}
                  </p>
                  <span className="mt-1 inline-block text-xs text-surface-400 dark:text-surface-500">
                    by {log.user}
                  </span>
                </div>
                <svg className="h-4 w-4 shrink-0 self-center text-surface-300 transition group-hover:text-brand-500 dark:text-surface-600 dark:group-hover:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </Link>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-surface-400 dark:text-surface-500">
            Page {pagination.page} of {pagination.totalPages}
            <span className="ml-1">({pagination.total} total)</span>
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex items-center gap-1 rounded-lg border border-surface-200 bg-white px-2.5 py-1.5 text-sm font-medium text-surface-500 transition hover:border-surface-300 disabled:cursor-not-allowed disabled:opacity-40 dark:border-panel-200 dark:bg-panel-300 dark:text-surface-300 dark:hover:border-surface-500"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {(() => {
              const { page, totalPages } = pagination
              const pages: (number | "...")[] = []
              const range = 2
              pages.push(1)
              if (page - range > 2) pages.push("...")
              for (let i = Math.max(2, page - range); i <= Math.min(totalPages - 1, page + range); i++) {
                pages.push(i)
              }
              if (page + range < totalPages - 1) pages.push("...")
              if (totalPages > 1) pages.push(totalPages)
              return pages.map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-sm text-surface-400 dark:text-surface-500">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition ${
                      p === page
                        ? "bg-brand-500 text-white shadow-sm"
                        : "border border-surface-200 bg-white text-surface-500 hover:border-surface-300 dark:border-panel-200 dark:bg-panel-300 dark:text-surface-300 dark:hover:border-surface-500"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )
            })()}

            <button
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="flex items-center gap-1 rounded-lg border border-surface-200 bg-white px-2.5 py-1.5 text-sm font-medium text-surface-500 transition hover:border-surface-300 disabled:cursor-not-allowed disabled:opacity-40 dark:border-panel-200 dark:bg-panel-300 dark:text-surface-300 dark:hover:border-surface-500"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
