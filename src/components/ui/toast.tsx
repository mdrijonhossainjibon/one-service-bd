"use client"

import { useReducer, useCallback } from "react"
import { createContext, useContext } from "react"

type Toast = {
  id: string
  message: string
  type: "success" | "error" | "info" | "warning"
}

type ToastState = {
  toasts: Toast[]
}

type ToastAction =
  | { type: "ADD"; toast: Toast }
  | { type: "REMOVE"; id: string }

type ToastContextValue = {
  toasts: Toast[]
  addToast: (message: string, type?: Toast["type"]) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case "ADD":
      return { ...state, toasts: [...state.toasts, action.toast] }
    case "REMOVE":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) }
    default:
      return state
  }
}

let toastCounter = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] })

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = `toast-${++toastCounter}`
    dispatch({ type: "ADD", toast: { id, message, type } })
    setTimeout(() => dispatch({ type: "REMOVE", id }), 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    dispatch({ type: "REMOVE", id })
  }, [])

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const ctx = useContext(ToastContext)
  if (!ctx) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {ctx.toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all animate-in slide-in-from-right ${
            toast.type === "success"
              ? "bg-[#2D9F6F] text-white"
              : toast.type === "error"
                ? "bg-[#D94F4F] text-white"
                : toast.type === "warning"
                  ? "bg-[#E5A43C] text-white"
                  : "bg-[#C49A3C] text-white"
          }`}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => ctx.removeToast(toast.id)}
            className="ml-2 opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within a ToastProvider")
  return ctx
}
