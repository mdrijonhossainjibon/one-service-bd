"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"

function StatCard({
  icon,
  iconBg,
  iconColor,
  trend,
  trendColor,
  value,
  label,
  children,
}: {
  icon: string
  iconBg: string
  iconColor: string
  trend: string
  trendColor: string
  value: string | React.ReactNode
  label: string
  children?: React.ReactNode
}) {
  return (
    <div className="card relative overflow-hidden p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <i className={`fa-solid ${icon} ${iconColor}`} />
        </div>
        <span className={`text-xs font-semibold ${trendColor} bg-white px-2 py-1 rounded-md`}>
          {trend}
        </span>
      </div>
      <div className="text-2xl font-heading font-bold text-[#1F2028]">{value}</div>
      <div className="text-sm text-surface-400 mt-1">{label}</div>
      {children}
    </div>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="font-heading font-bold text-xl text-[#1F2028]">Dashboard</h1>
        <p className="text-sm text-surface-400 mt-0.5">Overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          icon="fa-users"
          iconBg="bg-brand-50"
          iconColor="text-brand-600"
          trend="+12%"
          trendColor="text-brand-600"
          value="2,847"
          label="Total Users"
        />
        <StatCard
          icon="fa-key"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          trend="+8%"
          trendColor="text-emerald-700"
          value="1,563"
          label="Active Licenses"
        />
        <StatCard
          icon="fa-dollar-sign"
          iconBg="bg-sky-50"
          iconColor="text-sky-600"
          trend="+23%"
          trendColor="text-sky-700"
          value={<span>$48,920</span>}
          label="Monthly Revenue"
        />
        <StatCard
          icon="fa-server"
          iconBg="bg-rose-50"
          iconColor="text-rose-500"
          trend=""
          trendColor=""
          value=""
          label="Uptime"
        >
          <div className="flex items-center gap-1.5 mt-2">
            <div className="relative w-2 h-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <div className="absolute inset-[-3px] rounded-full border-2 border-emerald-500 opacity-0 pulse-dot" />
            </div>
            <span className="text-xs font-semibold text-emerald-600">Online</span>
          </div>
          <div className="text-2xl font-heading font-bold text-[#1F2028] mt-1">99.97%</div>
          <div className="text-sm text-surface-400 mt-1">Uptime</div>
        </StatCard>
      </div>

      {/* Charts and quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* License Usage Trends */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-heading font-bold text-base mb-4 text-[#1F2028]">License Usage Trends</h3>
          <div className="space-y-4">
            {[
              { label: "Jan", active: 980, new: 120 },
              { label: "Feb", active: 1100, new: 140 },
              { label: "Mar", active: 1240, new: 180 },
              { label: "Apr", active: 1380, new: 200 },
              { label: "May", active: 1470, new: 160 },
              { label: "Jun", active: 1563, new: 190 },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-3">
                <span className="text-xs font-medium text-surface-400 w-8">{m.label}</span>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-surface-400 w-10">Active</span>
                    <div className="flex-1 h-2 rounded-full bg-surface-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all"
                        style={{ width: `${(m.active / 1600) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-surface-500 w-12 text-right">{m.active}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-surface-400 w-10">New</span>
                    <div className="flex-1 h-2 rounded-full bg-surface-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${(m.new / 200) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-surface-500 w-12 text-right">{m.new}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* License Status */}
        <div className="card p-5">
          <h3 className="font-heading font-bold text-base mb-4 text-[#1F2028]">License Status</h3>
          <div className="space-y-3">
            {[
              { label: "Active", pct: 68, color: "bg-emerald-500" },
              { label: "Expired", pct: 18, color: "bg-amber-500" },
              { label: "Revoked", pct: 8, color: "bg-surface-300" },
              { label: "Trial", pct: 6, color: "bg-brand-400" },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                    <span className="text-surface-500">{s.label}</span>
                  </div>
                  <span className="font-medium text-surface-600">{s.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-100 overflow-hidden">
                  <div className={`h-full rounded-full ${s.color} transition-all`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions for non-admin */}
      {session?.user && (
        <div className="card p-5">
          <h3 className="font-heading font-bold text-base mb-4 text-[#1F2028]">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/dashboard/licenses"
              className="flex flex-col items-center gap-2 rounded-xl border border-surface-100 p-4 hover:border-brand-500/30 hover:bg-brand-50/50 transition-all text-surface-500 hover:text-brand-600"
            >
              <i className="fa-solid fa-key text-lg" />
              <span className="text-xs font-medium">View Licenses</span>
            </Link>
            <Link
              href="/dashboard/users"
              className="flex flex-col items-center gap-2 rounded-xl border border-surface-100 p-4 hover:border-brand-500/30 hover:bg-brand-50/50 transition-all text-surface-500 hover:text-brand-600"
            >
              <i className="fa-solid fa-users text-lg" />
              <span className="text-xs font-medium">Manage Users</span>
            </Link>
            <Link
              href="/dashboard/activity"
              className="flex flex-col items-center gap-2 rounded-xl border border-surface-100 p-4 hover:border-brand-500/30 hover:bg-brand-50/50 transition-all text-surface-500 hover:text-brand-600"
            >
              <i className="fa-solid fa-clock-rotate-left text-lg" />
              <span className="text-xs font-medium">Activity Log</span>
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex flex-col items-center gap-2 rounded-xl border border-surface-100 p-4 hover:border-brand-500/30 hover:bg-brand-50/50 transition-all text-surface-500 hover:text-brand-600"
            >
              <i className="fa-solid fa-gear text-lg" />
              <span className="text-xs font-medium">Settings</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
