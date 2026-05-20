"use client"

import { useState } from "react"
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
    allowRegistration: true,
    requireEmailVerification: true,
    maintenanceMode: false,
  })

  const [saving, setSaving] = useState(false)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      addToast("Settings saved successfully", "success")
    }, 600)
  }

  function update<K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const inputClass =
    "mt-1 block w-full rounded-lg border border-surface-200 bg-white px-3 py-2.5 text-sm text-[#1F2028] placeholder-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-panel-200 dark:bg-panel-200 dark:text-white dark:placeholder-surface-500"

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-xl text-[#1F2028] dark:text-white">Settings</h1>
          <p className="text-sm text-surface-400 mt-0.5 dark:text-surface-300">Configure your application preferences</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* General */}
        <div className="rounded-xl border border-surface-100 bg-white p-6 dark:border-panel-200 dark:bg-panel-300">
          <div className="flex items-start gap-4 mb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-[#1F2028] dark:text-white">General</h2>
              <p className="text-sm text-surface-400 dark:text-surface-400">Core application configuration</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-surface-600 dark:text-surface-300">
                <svg className="h-4 w-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Application Name
              </label>
              <input type="text" value={settings.appName} onChange={(e) => update("appName", e.target.value)} className={inputClass} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-surface-600 dark:text-surface-300">
                  <svg className="h-4 w-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Max Failed Attempts
                </label>
                <input type="number" value={settings.maxFailedAttempts} onChange={(e) => update("maxFailedAttempts", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-surface-600 dark:text-surface-300">
                  <svg className="h-4 w-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Session Timeout (min)
                </label>
                <input type="number" value={settings.sessionTimeout} onChange={(e) => update("sessionTimeout", e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* Registration */}
        <div className="rounded-xl border border-surface-100 bg-white p-6 dark:border-panel-200 dark:bg-panel-300">
          <div className="flex items-start gap-4 mb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-[#1F2028] dark:text-white">Registration</h2>
              <p className="text-sm text-surface-400 dark:text-surface-400">User sign-up and access control</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { key: "allowRegistration" as const, label: "Allow Registration", desc: "New users can create an account", icon: (
                <svg className="h-4 w-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              )},
              { key: "requireEmailVerification" as const, label: "Require Email Verification", desc: "Users must verify their email before accessing the dashboard", icon: (
                <svg className="h-4 w-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )},
              { key: "maintenanceMode" as const, label: "Maintenance Mode", desc: "Restrict all user access during maintenance", icon: (
                <svg className="h-4 w-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
              )},
            ].map(({ key, label, desc, icon }) => (
              <div key={key} className="flex items-center justify-between rounded-lg border border-surface-100 bg-surface-50/50 px-4 py-3 dark:border-panel-200 dark:bg-panel-200/50">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{icon}</div>
                  <div>
                    <p className="text-sm font-medium text-[#1F2028] dark:text-white">{label}</p>
                    <p className="text-xs text-surface-400 mt-0.5">{desc}</p>
                  </div>
                </div>
                <Toggle checked={settings[key]} onChange={(v) => update(key, v)} />
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => addToast("Changes discarded", "info")}
            className="rounded-lg border border-surface-200 bg-white px-5 py-2.5 text-sm font-medium text-surface-500 transition hover:border-surface-300 dark:border-panel-200 dark:bg-panel-300 dark:text-surface-300 dark:hover:border-surface-500"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-500 to-brand-400 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:from-brand-400 hover:to-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
