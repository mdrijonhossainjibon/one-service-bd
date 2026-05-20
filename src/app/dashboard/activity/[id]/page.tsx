"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
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

const typeConfig: Record<LogType, { dot: string; bg: string; label: string; icon: React.ReactNode }> = {
  success: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    label: "Success",
    icon: (
      <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  warning: {
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    label: "Warning",
    icon: (
      <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
  },
  error: {
    dot: "bg-danger",
    bg: "bg-red-50 dark:bg-red-500/10",
    label: "Error",
    icon: (
      <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  info: {
    dot: "bg-brand-500",
    bg: "bg-brand-50 dark:bg-brand-500/10",
    label: "Info",
    icon: (
      <svg className="h-5 w-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
}

function formatFull(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, "0")
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
    weekday: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getDay()],
    raw: d,
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [log, setLog] = useState<LogEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/activity/log/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found")
        return r.json()
      })
      .then((data) => setLog(data))
      .catch(() => router.replace("/dashboard/activity"))
      .finally(() => setLoading(false))
  }, [id, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-sm text-surface-400 dark:text-surface-300">
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading activity...
        </div>
      </div>
    )
  }

  if (!log) return null

  const cfg = typeConfig[log.type]
  const fmt = formatFull(log.timestamp)

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Back link */}
      <Link
        href="/dashboard/activity"
        className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-brand-600 transition dark:text-surface-400 dark:hover:text-brand-400"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Activity Log
      </Link>

      {/* Header card */}
      <div className="rounded-xl border border-surface-100 bg-white p-6 dark:border-panel-200 dark:bg-panel-300">
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
            {cfg.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h1 className="text-lg font-heading font-bold text-[#1F2028] dark:text-white truncate">
                {log.action}
              </h1>
              <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.dot.replace("bg-", "text-")}`}>
                {cfg.label}
              </span>
            </div>
            <p className="text-sm text-surface-400 mt-1 dark:text-surface-400">
              {fmt.weekday}, {fmt.date} at {fmt.time}
            </p>
          </div>
        </div>
      </div>

      {/* Detail rows */}
      <div className="rounded-xl border border-surface-100 bg-white p-6 space-y-5 dark:border-panel-200 dark:bg-panel-300">
        {/* ID */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">Entry ID</label>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-sm text-[#1F2028] dark:text-surface-300 font-mono break-all">{log.id}</code>
            <button
              onClick={() => {
                copyToClipboard(log.id)
                setCopied(true)
                setTimeout(() => setCopied(false), 1500)
              }}
              className="shrink-0 p-1 rounded-md text-surface-400 hover:text-brand-600 hover:bg-brand-50 transition dark:hover:text-brand-400 dark:hover:bg-brand-500/10"
              title="Copy ID"
            >
              {copied ? (
                <svg className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <hr className="border-surface-100 dark:border-panel-200" />

        {/* Action */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">Action</label>
          <p className="text-sm text-[#1F2028] mt-1 dark:text-white">{log.action}</p>
        </div>

        <hr className="border-surface-100 dark:border-panel-200" />

        {/* User */}
        <div className="flex items-start gap-8">
          <div className="flex-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">Performed By</label>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-400">
                {(log.user.charAt(0) || "?").toUpperCase()}
              </div>
              <span className="text-sm text-[#1F2028] dark:text-white">{log.user}</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">Type</label>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={`h-2 w-2 rounded-full ${cfg.dot}`} />
              <span className="text-sm text-[#1F2028] dark:text-white">{cfg.label}</span>
            </div>
          </div>
        </div>

        <hr className="border-surface-100 dark:border-panel-200" />

        {/* Details */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">Details</label>
          <div className="mt-2 rounded-lg border border-surface-100 bg-surface-50/70 p-4 dark:border-panel-200 dark:bg-panel-200/50">
            <p className="text-sm text-[#1F2028] leading-relaxed dark:text-surface-300">
              {log.details || <span className="italic text-surface-400">No additional details</span>}
            </p>
          </div>
        </div>

        <hr className="border-surface-100 dark:border-panel-200" />

        {/* Timestamp */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">Timestamp</label>
          <div className="flex items-center gap-6 mt-1">
            <div>
              <span className="text-xs text-surface-400 dark:text-surface-500">Date</span>
              <p className="text-sm text-[#1F2028] dark:text-white">{fmt.date}</p>
            </div>
            <div>
              <span className="text-xs text-surface-400 dark:text-surface-500">Time</span>
              <p className="text-sm text-[#1F2028] dark:text-white">{fmt.time}</p>
            </div>
            <div>
              <span className="text-xs text-surface-400 dark:text-surface-500">Day</span>
              <p className="text-sm text-[#1F2028] dark:text-white">{fmt.weekday}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
