"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

function generateOtp() {
  let c = ""
  for (let i = 0; i < 6; i++) c += Math.floor(Math.random() * 10)
  return c
}

export default function LoginPage() {
  const router = useRouter()

  // --- fields ---
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotNewPw, setForgotNewPw] = useState("")
  const [forgotConfirmPw, setForgotConfirmPw] = useState("")
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""])

  // --- ui state ---
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showForgot, setShowForgot] = useState(false)
  const [forgotStep, setForgotStep] = useState(1) // 1 = email, 2 = otp+reset, 3 = done
  const [generatedOtp, setGeneratedOtp] = useState("")
  const [resendTimer, setResendTimer] = useState(0)
  const [pwStrength, setPwStrength] = useState({ pct: "0%", color: "transparent", label: "", labelColor: "" })
  const resendRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // cleanup timer
  useEffect(() => () => { if (resendRef.current) clearInterval(resendRef.current) }, [])

  // --- helpers ---
  const toast = (msg: string, type: "success" | "error" | "info" = "info") => {
    const container = document.getElementById("toast-container")
    if (!container) return
    const t = document.createElement("div")
    t.className = `fixed bottom-6 right-6 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl z-[100] transition-all duration-300 ${
      type === "success" ? "bg-emerald-600 text-white" : type === "error" ? "bg-rose-600 text-white" : "bg-brand-500 text-white"
    }`
    t.textContent = msg
    document.body.appendChild(t)
    setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 300) }, 3000)
  }

  // --- login ---
  const handleLogin = async () => {
    setError("")
    if (!email || !password) { setError("Enter email and password"); return }
    setLoading(true)
    try {
      const result = await signIn("credentials", { email, password, redirect: false })
      if (result?.ok) {
        router.push("/dashboard")
        router.refresh()
      } else {
        setLoading(false)
        setError(result?.error || "Invalid credentials")
      }
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : "Connection failed. Check your network.")
    }
  }

  const handleGoogleSignIn = () => {
    setLoading(true)
    signIn("google", { callbackUrl: "/dashboard" })
  }

  // --- forgot password ---
  const startResendTimer = () => {
    setResendTimer(30)
    if (resendRef.current) clearInterval(resendRef.current)
    resendRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { if (resendRef.current) clearInterval(resendRef.current); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const checkStrength = (p: string) => {
    let s = 0
    if (p.length >= 6) s++
    if (p.length >= 10) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    const levels = [
      { pct: "0%", color: "transparent", label: "", labelColor: "rgba(255,255,255,0.25)" },
      { pct: "20%", color: "#D94F4F", label: "Very weak", labelColor: "#D94F4F" },
      { pct: "40%", color: "#E5A43C", label: "Weak", labelColor: "#E5A43C" },
      { pct: "60%", color: "#D4A85B", label: "Fair", labelColor: "#D4A85B" },
      { pct: "80%", color: "#2D9F6F", label: "Strong", labelColor: "#2D9F6F" },
      { pct: "100%", color: "#1A7F4F", label: "Very strong", labelColor: "#1A7F4F" },
    ]
    const lvl = p.length === 0 ? levels[0] : levels[Math.min(s, 5)]
    setPwStrength({ pct: lvl.pct, color: lvl.color, label: lvl.label, labelColor: lvl.labelColor })
  }

  const handleOtpChange = (idx: number, val: string) => {
    const digit = val.replace(/[^0-9]/g, "").slice(0, 1)
    const next = [...otpValues]
    next[idx] = digit
    setOtpValues(next)
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus()
  }
  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpValues[idx] && idx > 0) {
      const next = [...otpValues]
      next[idx - 1] = ""
      setOtpValues(next)
      otpRefs.current[idx - 1]?.focus()
    }
    if (e.key === "Enter") handleForgotReset()
  }
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const data = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6)
    const next = [...otpValues]
    data.split("").forEach((ch, i) => { if (i < 6) next[i] = ch })
    setOtpValues(next)
    const focusIdx = Math.min(data.length, 5)
    otpRefs.current[focusIdx]?.focus()
  }

  const handleForgotSendCode = () => {
    setError("")
    if (!forgotEmail || !forgotEmail.includes("@")) { setError("Enter a valid email"); return }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const otp = generateOtp()
      setGeneratedOtp(otp)
      setForgotStep(2)
      startResendTimer()
      toast("Code sent", "success")
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    }, 1200)
  }

  const handleResendCode = () => {
    if (resendTimer > 0) return
    const otp = generateOtp()
    setGeneratedOtp(otp)
    setOtpValues(["", "", "", "", "", ""])
    startResendTimer()
    toast("New code sent", "success")
    otpRefs.current[0]?.focus()
  }

  const handleForgotReset = () => {
    setError("")
    const code = otpValues.join("")
    if (code.length !== 6) { setError("Enter full verification code"); return }
    if (forgotNewPw.length < 6) { setError("Password min 6 characters"); return }
    if (forgotNewPw !== forgotConfirmPw) { setError("Passwords do not match"); return }
    setForgotStep(3)
    if (resendRef.current) clearInterval(resendRef.current)
  }

  const enterForgot = () => {
    setShowForgot(true)
    setError("")
    setForgotStep(1)
    setForgotEmail(email)
    setOtpValues(["", "", "", "", "", ""])
    setForgotNewPw("")
    setForgotConfirmPw("")
    setPwStrength({ pct: "0%", color: "transparent", label: "", labelColor: "" })
    setGeneratedOtp("")
  }

  const exitForgot = () => {
    setShowForgot(false)
    setError("")
    setForgotStep(1)
    if (resendRef.current) clearInterval(resendRef.current)
  }

  // --- render ---
  const inputClass =
    "w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/25 outline-none transition-all duration-200 focus:border-brand-500 focus:shadow-[0_0_0_3px_rgba(196,154,60,0.15)] focus:bg-white/6"
  const labelClass = "block text-white/50 text-sm font-medium mb-1.5"
  const btnPrimary =
    "w-full py-3.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 border-none outline-none font-[family-name:var(--font-dm-sans)] active:scale-[0.98] bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 hover:-translate-y-0.5"
  const btnGoogle =
    "w-full py-3.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 border-none outline-none font-[family-name:var(--font-dm-sans)] active:scale-[0.98] bg-white/5 text-white border border-white/10 hover:bg-white/10"

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0D0F13] via-[#1A1D23] to-[#22252C] relative overflow-hidden">
      {/* floating orbs */}
      <div className="absolute w-[600px] h-[600px] -top-40 -right-40 rounded-full bg-gradient-to-r from-brand-500/8 to-transparent pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] -bottom-32 -left-24 rounded-full bg-gradient-to-r from-emerald-500/6 to-transparent pointer-events-none" />

      {/* left panel — brand info */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 relative z-10">
        <div className="max-w-[520px]">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <i className="fa-solid fa-bolt text-white text-lg" />
            </div>
            <span className="font-heading font-bold text-2xl text-white tracking-tight">One Service 𝓑𝓓</span>
          </div>

          <h1 className="font-heading font-extrabold text-5xl text-white leading-tight mb-5" style={{ lineHeight: 1.15 }}>
            Manage your<br />services with<br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-300 bg-clip-text text-transparent">precision.</span>
          </h1>

          <p className="text-white/40 text-lg mb-14 leading-relaxed" style={{ maxWidth: 400 }}>
            Enterprise-grade admin panel for license management, user control, and real-time analytics.
          </p>

          <div className="space-y-1">
            {[
              { icon: "fa-shield-halved", iconBg: "bg-brand-500/10", iconColor: "text-brand-400", title: "Enterprise Security", desc: "End-to-end encryption and role-based access" },
              { icon: "fa-chart-line", iconBg: "bg-emerald-500/10", iconColor: "text-emerald-400", title: "Real-time Analytics", desc: "Monitor licenses, users, and revenue" },
              { icon: "fa-key", iconBg: "bg-sky-500/10", iconColor: "text-sky-400", title: "License Management", desc: "Create, reset, and revoke keys in seconds" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 py-4">
                <div className={`w-11 h-11 rounded-xl ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <i className={`fa-solid ${item.icon} ${item.iconColor}`} />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">{item.title}</div>
                  <div className="text-white/30 text-sm">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* right panel — auth card */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div
          id="login-card"
          className="w-full max-w-[440px] bg-white/3 backdrop-blur-xl border border-white/6 rounded-2xl p-10 shadow-[0_32px_64px_rgba(0,0,0,0.3)]"
        >
          <div>
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-500/20">
                <i className="fa-solid fa-bolt text-white text-xl" />
              </div>
              <h2 className="font-heading font-bold text-2xl text-white mb-1">Welcome back</h2>
              <p className="text-white/30 text-sm">Sign in to your admin dashboard</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2.5">
                <i className="fa-solid fa-circle-exclamation" /><span>{error}</span>
              </div>
            )}

            <div className="mb-4">
              <label className={labelClass}>Email</label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-sm" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} pl-11`} placeholder="admin@nexus.io" onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelClass}>Password</label>
                {/* forgot password button removed */}
              </div>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-sm" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pl-11 pr-11`} placeholder="Enter your password" onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
              </div>
            </div>

            <button onClick={handleLogin} disabled={loading} className={`${btnPrimary} ${loading ? "opacity-80" : ""}`}>
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Sign In"}
            </button>

            {showForgot ? (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={exitForgot}
                  className="mb-4 text-sm text-white/40 hover:text-white/60 transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none outline-none"
                >
                  <i className="fa-solid fa-arrow-left text-xs" /> Back to sign in
                </button>

                {forgotStep === 1 && (
                  <>
                    <p className="text-white/50 text-sm mb-5">Enter your email to receive a verification code.</p>
                    <div className="mb-5">
                      <label className={labelClass}>Email</label>
                      <div className="relative">
                        <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-sm" />
                        <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className={`${inputClass} pl-11`} placeholder="admin@nexus.io" onKeyDown={(e) => e.key === "Enter" && handleForgotSendCode()} />
                      </div>
                    </div>
                    <button onClick={handleForgotSendCode} disabled={loading} className={`${btnPrimary} ${loading ? "opacity-80" : ""}`}>
                      {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Send Code"}
                    </button>
                  </>
                )}

                {forgotStep === 2 && (
                  <>
                    <p className="text-white/50 text-sm mb-1">Enter the 6-digit code sent to <span className="text-white/70">{forgotEmail}</span></p>
                    <div className="flex items-center gap-2.5 mb-5" onPaste={handleOtpPaste}>
                      {otpValues.map((v, i) => (
                        <input
                          key={i}
                          ref={(el) => { otpRefs.current[i] = el }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={v}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="w-11 h-12 text-center bg-white/5 border border-white/10 rounded-lg text-white text-lg font-semibold outline-none transition-all duration-200 focus:border-brand-500 focus:shadow-[0_0_0_3px_rgba(196,154,60,0.15)]"
                        />
                      ))}
                    </div>

                    <div className="mb-4">
                      <label className={labelClass}>New Password</label>
                      <input type="password" value={forgotNewPw} onChange={(e) => { setForgotNewPw(e.target.value); checkStrength(e.target.value) }} className={inputClass} placeholder="Min 6 characters" />
                      {forgotNewPw.length > 0 && (
                        <div className="mt-2 flex items-center gap-2.5">
                          <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-300" style={{ width: pwStrength.pct, background: pwStrength.color }} />
                          </div>
                          <span className="text-xs font-medium" style={{ color: pwStrength.labelColor }}>{pwStrength.label}</span>
                        </div>
                      )}
                    </div>

                    <div className="mb-5">
                      <label className={labelClass}>Confirm Password</label>
                      <input type="password" value={forgotConfirmPw} onChange={(e) => setForgotConfirmPw(e.target.value)} className={inputClass} placeholder="Re-enter new password" onKeyDown={(e) => e.key === "Enter" && handleForgotReset()} />
                    </div>

                    <button onClick={handleForgotReset} className={btnPrimary}>Reset Password</button>

                    <div className="mt-4 text-center">
                      <span className="text-white/25 text-xs">{resendTimer > 0 ? `Resend code in ${resendTimer}s` : ""}</span>
                      {resendTimer === 0 && (
                        <button onClick={handleResendCode} className="text-xs text-brand-400 hover:text-brand-300 bg-transparent border-none outline-none cursor-pointer">Resend code</button>
                      )}
                    </div>
                  </>
                )}

                {forgotStep === 3 && (
                  <div className="text-center py-6">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                      <i className="fa-solid fa-check text-emerald-400 text-xl" />
                    </div>
                    <p className="text-white text-sm font-medium mb-1">Password reset successful</p>
                    <p className="text-white/40 text-sm mb-5">You can now sign in with your new password.</p>
                    <button onClick={exitForgot} className={btnPrimary}>Back to Sign In</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-white/8" />
                  <span className="text-white/20 text-xs">or</span>
                  <div className="flex-1 h-px bg-white/8" />
                </div>

                <button onClick={handleGoogleSignIn} disabled={loading} className={`${btnGoogle} ${loading ? "opacity-80" : ""}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  <span>Sign in with Google</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


