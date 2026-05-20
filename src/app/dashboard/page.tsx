"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"

type TrendMonth = { label: string; active: number; new: number }
type ActivityItem = { id: string; user: string; action: string; details: string; type: string; timestamp: string }

type Stats = {
  users: { total: number; active: number }
  licenses: { total: number; active: number; expired: number; revoked: number; trial: number }
  trends: TrendMonth[]
  activity: ActivityItem[]
}

function StatCard({
  icon,
  value,
  label,
  trend,
  trendColor,
  children,
}: {
  icon: React.ReactNode
  value: string | number | undefined
  label: string
  trend?: string
  trendColor?: string
  children?: React.ReactNode
}) {
  return (
    <div className="card relative overflow-hidden rounded-xl border border-surface-100 bg-white p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 dark:border-panel-200 dark:bg-panel-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold ${trendColor} bg-white px-2 py-1 rounded-md dark:bg-panel-200`}>
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-heading font-bold text-[#1F2028] dark:text-white">{value ?? "—"}</div>
      <div className="text-sm text-surface-400 mt-1 dark:text-surface-300">{label}</div>
      {children}
    </div>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="font-heading font-bold text-xl text-[#1F2028] dark:text-white">
          Welcome{stats ? `, ${session?.user?.name ?? "back"}` : ""}
        </h1>
        <p className="text-sm text-surface-400 mt-0.5 dark:text-surface-300">
          {loading ? "Loading..." : "Overview of your license management system"}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          }
          value={stats ? stats.users.total.toLocaleString() : undefined}
          label="Total Users"
        />
        <StatCard
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          }
          value={stats ? stats.licenses.active.toLocaleString() : undefined}
          label="Active Licenses"
        />
        <StatCard
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          value={stats ? stats.licenses.total.toLocaleString() : undefined}
          label="Total Licenses"
        />
        <StatCard
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
          }
          value={undefined}
          label="System Status"
        >
          <div className="flex items-center gap-1.5 mt-2">
            <div className="relative w-2 h-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <div className="absolute inset-[-3px] rounded-full border-2 border-emerald-500 opacity-0 pulse-dot" />
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Online</span>
          </div>
          <div className="text-2xl font-heading font-bold text-[#1F2028] mt-1 dark:text-white">Operational</div>
          <div className="text-sm text-surface-400 mt-1 dark:text-surface-300">All systems running</div>
        </StatCard>
      </div>

      {/* Charts and activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* License Trends */}
        <div className="rounded-xl border border-surface-100 bg-white p-5 lg:col-span-2 dark:border-panel-200 dark:bg-panel-300">
          <h3 className="font-heading font-bold text-base mb-4 text-[#1F2028] dark:text-white">License Usage Trends</h3>
          {loading ? (
            <div className="h-40 flex items-center justify-center text-sm text-surface-400">Loading...</div>
          ) : (
            <div className="space-y-4">
              {(stats?.trends ?? []).map((m) => {
                const maxActive = Math.max(...(stats?.trends ?? []).map((t) => t.active), 1)
                const maxNew = Math.max(...(stats?.trends ?? []).map((t) => t.new), 1)
                return (
                  <div key={m.label} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-surface-400 dark:text-surface-400 w-8">{m.label}</span>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-surface-400 dark:text-surface-400 w-10">Active</span>
                        <div className="flex-1 h-2 rounded-full bg-surface-100 dark:bg-panel-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-brand-500 transition-all"
                            style={{ width: `${(m.active / maxActive) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-surface-500 dark:text-surface-300 w-12 text-right">{m.active}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-surface-400 dark:text-surface-400 w-10">New</span>
                        <div className="flex-1 h-2 rounded-full bg-surface-100 dark:bg-panel-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${(m.new / maxNew) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-surface-500 dark:text-surface-300 w-12 text-right">{m.new}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* License Status Distribution */}
        <div className="rounded-xl border border-surface-100 bg-white p-5 dark:border-panel-200 dark:bg-panel-300">
          <h3 className="font-heading font-bold text-base mb-4 text-[#1F2028] dark:text-white">License Status</h3>
          {loading ? (
            <div className="h-40 flex items-center justify-center text-sm text-surface-400">Loading...</div>
          ) : (
            (() => {
              const total = stats?.licenses.total ?? 0
              const items = [
                { label: "Active", count: stats?.licenses.active ?? 0, color: "bg-emerald-500" },
                { label: "Expired", count: stats?.licenses.expired ?? 0, color: "bg-amber-500" },
                { label: "Revoked", count: stats?.licenses.revoked ?? 0, color: "bg-surface-300 dark:bg-surface-600" },
                { label: "Trial", count: stats?.licenses.trial ?? 0, color: "bg-brand-400" },
              ]
              return (
                <div className="space-y-3">
                  {items.map((s) => {
                    const pct = total > 0 ? Math.round((s.count / total) * 100) : 0
                    return (
                      <div key={s.label}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                            <span className="text-surface-500 dark:text-surface-300">{s.label}</span>
                          </div>
                          <span className="font-medium text-surface-600 dark:text-white">
                            {s.count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-surface-100 dark:bg-panel-100 overflow-hidden">
                          <div className={`h-full rounded-full ${s.color} transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()
          )}
        </div>
      </div>

      {/* Recent Activity & Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Activity Feed */}
        <div className="rounded-xl border border-surface-100 bg-white p-5 lg:col-span-2 dark:border-panel-200 dark:bg-panel-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-base text-[#1F2028] dark:text-white">Recent Activity</h3>
            <Link
              href="/dashboard/activity"
              className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              View all
            </Link>
          </div>
          {loading ? (
            <div className="h-40 flex items-center justify-center text-sm text-surface-400">Loading...</div>
          ) : (
            <div className="space-y-2">
              {(stats?.activity ?? []).length === 0 && (
                <p className="text-sm text-surface-400 py-4 text-center">No activity yet</p>
              )}
              {(stats?.activity ?? []).map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 rounded-lg border border-surface-100 bg-surface-50/50 p-3 dark:border-panel-200 dark:bg-panel-200/50"
                >
                  <div
                    className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                      a.type === "error"
                        ? "bg-danger"
                        : a.type === "warning"
                          ? "bg-warning"
                          : a.type === "success"
                            ? "bg-success"
                            : "bg-surface-300 dark:bg-surface-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-[#1F2028] dark:text-white truncate">{a.action}</span>
                      <span className="text-xs text-surface-400 whitespace-nowrap shrink-0">{a.timestamp}</span>
                    </div>
                    <p className="text-xs text-surface-400 mt-0.5 truncate">{a.details || a.user}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-surface-100 bg-white p-5 dark:border-panel-200 dark:bg-panel-300">
          <h3 className="font-heading font-bold text-base mb-4 text-[#1F2028] dark:text-white">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/dashboard/licenses"
              className="flex flex-col items-center gap-2 rounded-xl border border-surface-100 p-4 hover:border-brand-500/30 hover:bg-brand-50/50 transition-all text-surface-500 hover:text-brand-600 dark:border-panel-200 dark:text-surface-300 dark:hover:border-brand-500/30 dark:hover:bg-brand-500/5 dark:hover:text-brand-400"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span className="text-xs font-medium">Licenses</span>
            </Link>
            <Link
              href="/dashboard/users"
              className="flex flex-col items-center gap-2 rounded-xl border border-surface-100 p-4 hover:border-brand-500/30 hover:bg-brand-50/50 transition-all text-surface-500 hover:text-brand-600 dark:border-panel-200 dark:text-surface-300 dark:hover:border-brand-500/30 dark:hover:bg-brand-500/5 dark:hover:text-brand-400"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <span className="text-xs font-medium">Users</span>
            </Link>
            <Link
              href="/dashboard/activity"
              className="flex flex-col items-center gap-2 rounded-xl border border-surface-100 p-4 hover:border-brand-500/30 hover:bg-brand-50/50 transition-all text-surface-500 hover:text-brand-600 dark:border-panel-200 dark:text-surface-300 dark:hover:border-brand-500/30 dark:hover:bg-brand-500/5 dark:hover:text-brand-400"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span className="text-xs font-medium">Activity</span>
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex flex-col items-center gap-2 rounded-xl border border-surface-100 p-4 hover:border-brand-500/30 hover:bg-brand-50/50 transition-all text-surface-500 hover:text-brand-600 dark:border-panel-200 dark:text-surface-300 dark:hover:border-brand-500/30 dark:hover:bg-brand-500/5 dark:hover:text-brand-400"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs font-medium">Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
