"use client"

import { useState } from "react"

import { useToast } from "@/components/ui/toast"

export default function SettingsPage() {
  const { addToast } = useToast()
  const [settings, setSettings] = useState({
    appName: "License Manager",
    maxFailedAttempts: "5",
    sessionTimeout: "60",
    allowRegistration: true,
    requireEmailVerification: true,
    defaultLicenseType: "basic",
    licenseDuration: "365",
    maintenanceMode: false,
  })

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    addToast("Settings saved successfully", "success")
  }

  const inputClass = "mt-1 block w-full rounded-lg border border-surface-200 px-3 py-2 text-sm text-[#1F2028] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white"

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading font-bold text-xl text-[#1F2028]">Settings</h1>
        <p className="mt-1 text-sm text-surface-400">
          Configure your application
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General */}
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-heading font-semibold text-[#1F2028]">General</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-500">Application Name</label>
              <input
                type="text"
                value={settings.appName}
                onChange={(e) => setSettings((prev) => ({ ...prev, appName: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-surface-500">Max Failed Attempts</label>
                <input
                  type="number"
                  value={settings.maxFailedAttempts}
                  onChange={(e) => setSettings((prev) => ({ ...prev, maxFailedAttempts: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-500">Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings((prev) => ({ ...prev, sessionTimeout: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Registration */}
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-heading font-semibold text-[#1F2028]">Registration</h2>
          <div className="space-y-4">
            {(["allowRegistration", "requireEmailVerification", "maintenanceMode"] as const).map((key) => (
              <label key={key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.checked }))}
                  className="h-4 w-4 rounded border-surface-200 text-brand-500 focus:ring-brand-500/20"
                />
                <span className="text-sm text-surface-500 capitalize">
                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* License defaults */}
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-heading font-semibold text-[#1F2028]">License Defaults</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-surface-500">Default License Type</label>
              <select
                value={settings.defaultLicenseType}
                onChange={(e) => setSettings((prev) => ({ ...prev, defaultLicenseType: e.target.value }))}
                className={inputClass}
              >
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-500">License Duration (days)</label>
              <input
                type="number"
                value={settings.licenseDuration}
                onChange={(e) => setSettings((prev) => ({ ...prev, licenseDuration: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-brand-500 to-brand-400 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:from-brand-400 hover:to-brand-500"
          >
            Save Settings
          </button>
        </div>
      </form>

      <style>{`
        .card { background: #fff; border-radius: 14px; border: 1px solid #E8E5DE; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
      `}</style>
    </div>
  )
}
