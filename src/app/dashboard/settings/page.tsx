"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/toast"

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
        checked ? "bg-brand-500" : "bg-surface-200 dark:bg-panel-100"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4.5 w-4.5 translate-y-0 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
          checked ? "translate-x-4.5" : "translate-x-0.5"
        }`}
      />
    </button>
  )
}

export default function SettingsPage() {
  const { addToast } = useToast()
  const [settings, setSettings] = useState({
    appName: "License Manager",
    maxFailedAttempts: "5",
    sessionTimeout: "60",
    maintenanceMode: false,
  })

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return
        setSettings({
          appName: data.appName ?? "License Manager",
          maxFailedAttempts: String(data.maxFailedAttempts ?? 5),
          sessionTimeout: String(data.sessionTimeout ?? 60),
          maintenanceMode: data.maintenanceMode ?? false,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appName: settings.appName,
          maxFailedAttempts: Number(settings.maxFailedAttempts),
          sessionTimeout: Number(settings.sessionTimeout),
          maintenanceMode: settings.maintenanceMode,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save")
      addToast("Settings saved successfully", "success")
    } catch (err) {
      addToast("Failed to save settings", "error")
    } finally {
      setSaving(false)
    }
  }

  function update<K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const inputClass =
    "mt-1 block w-full rounded-lg border border-surface-200 bg-white px-3 py-2.5 text-sm text-[#1F2028] placeholder-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-panel-200 dark:bg-panel-200 dark:text-white dark:placeholder-surface-500"

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-[#1F2028] dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Manage your application settings</p>
      </div>

      {/* General Settings */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-xl border border-surface-200 bg-white dark:border-panel-200 dark:bg-panel-300">
          <div className="flex items-center justify-between border-b border-surface-100 px-6 py-4 dark:border-panel-200">
            <div>
              <h2 className="font-heading font-semibold text-lg text-[#1F2028] dark:text-white">General</h2>
              <p className="text-sm text-surface-400 dark:text-surface-500">Core application settings</p>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="text-sm font-medium text-[#1F2028] dark:text-white">Application Name</label>
              <input
                type="text"
                className={inputClass}
                value={settings.appName}
                onChange={(e) => update("appName", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#1F2028] dark:text-white">Max Failed Attempts</label>
                <input
                  type="number"
                  className={inputClass}
                  value={settings.maxFailedAttempts}
                  onChange={(e) => update("maxFailedAttempts", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#1F2028] dark:text-white">Session Timeout (min)</label>
                <input
                  type="number"
                  className={inputClass}
                  value={settings.sessionTimeout}
                  onChange={(e) => update("sessionTimeout", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="rounded-xl border border-surface-200 bg-white dark:border-panel-200 dark:bg-panel-300">
          <div className="flex items-center justify-between border-b border-surface-100 px-6 py-4 dark:border-panel-200">
            <div>
              <h2 className="font-heading font-semibold text-lg text-[#1F2028] dark:text-white">Security</h2>
              <p className="text-sm text-surface-400 dark:text-surface-500">Restrict access during maintenance</p>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { key: "maintenanceMode" as const, label: "Maintenance Mode", desc: "Block all API calls when maintenance is active. Use with caution.", icon: (
                  <svg className="h-4 w-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                )},
              ].map(({ key, label, desc, icon }) => (
                <div key={key} className="flex items-start justify-between rounded-lg border border-surface-100 bg-surface-50/50 p-4 dark:border-panel-200 dark:bg-panel-200/50">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-surface-100 dark:bg-panel-100">{icon}</div>
                    <div>
                      <p className="text-sm font-medium text-[#1F2028] dark:text-white">{label}</p>
                      <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">{desc}</p>
                    </div>
                  </div>
                  <Toggle checked={settings[key]} onChange={(v) => update(key, v)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-400 disabled:opacity-50"
          >
            {saving && (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  )
}
