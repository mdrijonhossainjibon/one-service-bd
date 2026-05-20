"use client"

import { useCallback, useEffect, useState } from "react"
import { useToast } from "@/components/ui/toast"

type PlanFeature = { name: string; value: string }

type Plan = {
  _id: string
  name: string
  price: number
  period: "monthly" | "yearly"
  description: string
  features: PlanFeature[]
  popular: boolean
  active: boolean
  createdAt: string
}

const defaultForm = {
  name: "",
  price: 0,
  period: "monthly" as "monthly" | "yearly",
  description: "",
  features: [{ name: "", value: "" }],
  popular: false,
}

export default function PlanPage() {
  const { addToast } = useToast()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Plan | null>(null)
  const [form, setForm] = useState({ ...defaultForm })
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null)

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/plans")
      const data = await res.json()
      setPlans(data.plans ?? [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  function openCreate() {
    setEditing(null)
    setForm({ ...defaultForm })
    setShowModal(true)
  }

  function openEdit(plan: Plan) {
    setEditing(plan)
    setForm({
      name: plan.name,
      price: plan.price,
      period: plan.period,
      description: plan.description,
      features: plan.features.length ? plan.features : [{ name: "", value: "" }],
      popular: plan.popular,
    })
    setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || form.price <= 0) {
      addToast("Name and price are required", "error")
      return
    }
    const cleanFeatures = form.features.filter((f) => f.name.trim())
    setSaving(true)
    try {
      const url = editing ? `/api/plans/${editing._id}` : "/api/plans"
      const method = editing ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, features: cleanFeatures }),
      })
      if (!res.ok) throw new Error()
      addToast(editing ? "Plan updated" : "Plan created", "success")
      setShowModal(false)
      fetchPlans()
    } catch {
      addToast("Failed to save plan", "error")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/plans/${deleteTarget._id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      addToast("Plan deleted", "success")
      setDeleteTarget(null)
      fetchPlans()
    } catch {
      addToast("Failed to delete plan", "error")
    }
  }

  function addFeature() {
    setForm((f) => ({ ...f, features: [...f.features, { name: "", value: "" }] }))
  }

  function removeFeature(i: number) {
    setForm((f) => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }))
  }

  function updateFeature(i: number, key: "name" | "value", val: string) {
    setForm((f) => {
      const feats = [...f.features]
      feats[i] = { ...feats[i], [key]: val }
      return { ...f, features: feats }
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-xl text-[#1F2028] dark:text-white">Plans</h1>
          <p className="text-sm text-surface-400 mt-0.5 dark:text-surface-300">Manage subscription plans and pricing</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-500 to-brand-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:from-brand-400 hover:to-brand-500"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Plan
        </button>
      </div>

      {/* Plan list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-sm text-surface-400">
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading plans...
          </div>
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-surface-400 dark:text-surface-500">
          <svg className="h-12 w-12 mb-4 text-surface-200 dark:text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-sm">No plans yet</p>
          <button onClick={openCreate} className="mt-2 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
            Create your first plan
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 items-start">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`relative rounded-xl border bg-white p-6 dark:bg-panel-300 ${
                plan.popular
                  ? "border-brand-500 shadow-lg shadow-brand-500/10 dark:border-brand-400"
                  : "border-surface-100 dark:border-panel-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-500 to-brand-400 px-3 py-1 text-[11px] font-bold text-white shadow-md">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    MOST POPULAR
                  </span>
                </div>
              )}

              {/* Card header */}
              <div className="text-center pb-4 border-b border-surface-100 dark:border-panel-200">
                <h3 className="font-heading font-bold text-lg text-[#1F2028] dark:text-white">{plan.name}</h3>
                <p className="text-sm text-surface-400 mt-1 dark:text-surface-300">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1 mt-4">
                  <span className="text-4xl font-heading font-extrabold text-[#1F2028] dark:text-white">${plan.price}</span>
                  <span className="text-sm text-surface-400 dark:text-surface-400">/{plan.period}</span>
                </div>
              </div>

              {/* Features list */}
              <ul className="mt-5 space-y-3">
                {plan.features.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <svg className="h-5 w-5 shrink-0 mt-0.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <span className="text-sm font-medium text-[#1F2028] dark:text-white">{f.name}</span>
                      <span className="text-sm text-surface-400 dark:text-surface-400"> — {f.value}</span>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Card actions */}
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => openEdit(plan)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-surface-200 bg-white px-4 py-2.5 text-sm font-medium text-surface-600 transition hover:border-surface-300 hover:text-brand-600 dark:border-panel-200 dark:bg-panel-300 dark:text-surface-300 dark:hover:border-surface-500 dark:hover:text-brand-400"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(plan)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-surface-200 bg-white px-4 py-2.5 text-sm font-medium text-surface-400 transition hover:border-red-300 hover:text-red-500 dark:border-panel-200 dark:bg-panel-300 dark:text-surface-400 dark:hover:border-red-500/50 dark:hover:text-red-400"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-lg mx-4 rounded-xl border border-surface-100 bg-white p-6 shadow-xl dark:border-panel-200 dark:bg-panel-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-base text-[#1F2028] dark:text-white">
                {editing ? "Edit Plan" : "Create Plan"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-surface-400 hover:text-surface-500 dark:hover:text-surface-300">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Premium"
                    className="mt-1 block w-full rounded-lg border border-surface-200 bg-white px-3 py-2.5 text-sm text-[#1F2028] placeholder-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-panel-200 dark:bg-panel-200 dark:text-white dark:placeholder-surface-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">Price ($)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                    className="mt-1 block w-full rounded-lg border border-surface-200 bg-white px-3 py-2.5 text-sm text-[#1F2028] placeholder-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-panel-200 dark:bg-panel-200 dark:text-white dark:placeholder-surface-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">Period</label>
                  <div className="relative mt-1">
                    <select
                      value={form.period}
                      onChange={(e) => setForm((f) => ({ ...f, period: e.target.value as "monthly" | "yearly" }))}
                      className="block w-full appearance-none rounded-lg border border-surface-200 bg-white px-3 py-2.5 pr-8 text-sm text-[#1F2028] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-panel-200 dark:bg-panel-200 dark:text-white"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="e.g. For growing businesses"
                    className="mt-1 block w-full rounded-lg border border-surface-200 bg-white px-3 py-2.5 text-sm text-[#1F2028] placeholder-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-panel-200 dark:bg-panel-200 dark:text-white dark:placeholder-surface-500"
                  />
                </div>
              </div>

              {/* Popular toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.popular}
                  onClick={() => setForm((f) => ({ ...f, popular: !f.popular }))}
                  className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${form.popular ? "bg-brand-500" : "bg-surface-200 dark:bg-panel-100"}`}
                >
                  <span className={`pointer-events-none inline-block h-4.5 w-4.5 translate-y-0 rounded-full bg-white shadow-sm transition-transform ${form.popular ? "translate-x-4.5" : "translate-x-0.5"}`} />
                </button>
                <span className="text-sm text-surface-600 dark:text-surface-300">Mark as popular</span>
              </label>

              {/* Features */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">Features</label>
                  <button type="button" onClick={addFeature} className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add feature
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {form.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feat.name}
                        onChange={(e) => updateFeature(idx, "name", e.target.value)}
                        placeholder="Feature name"
                        className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-[#1F2028] placeholder-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-panel-200 dark:bg-panel-200 dark:text-white dark:placeholder-surface-500"
                      />
                      <input
                        type="text"
                        value={feat.value}
                        onChange={(e) => updateFeature(idx, "value", e.target.value)}
                        placeholder="Value"
                        className="w-28 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-[#1F2028] placeholder-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-panel-200 dark:bg-panel-200 dark:text-white dark:placeholder-surface-500"
                      />
                      {form.features.length > 1 && (
                        <button type="button" onClick={() => removeFeature(idx)} className="p-1 text-surface-400 hover:text-red-500 transition">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-surface-200 bg-white px-4 py-2 text-sm font-medium text-surface-500 hover:border-surface-300 dark:border-panel-200 dark:bg-panel-300 dark:text-surface-300 dark:hover:border-surface-500">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-500 to-brand-400 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60">
                  {saving ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    editing ? "Update Plan" : "Create Plan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div className="w-full max-w-sm mx-4 rounded-xl border border-surface-100 bg-white p-6 shadow-xl dark:border-panel-200 dark:bg-panel-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
                <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <h3 className="text-center font-heading font-bold text-base text-[#1F2028] dark:text-white">Delete Plan</h3>
            <p className="text-center text-sm text-surface-400 mt-1 dark:text-surface-400">
              Are you sure you want to delete <span className="font-semibold text-[#1F2028] dark:text-white">{deleteTarget.name}</span>? This cannot be undone.
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-lg border border-surface-200 bg-white px-4 py-2.5 text-sm font-medium text-surface-500 hover:border-surface-300 dark:border-panel-200 dark:bg-panel-300 dark:text-surface-300 dark:hover:border-surface-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
