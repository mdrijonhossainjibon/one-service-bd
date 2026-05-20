"use client"

import { useState, useEffect, useCallback } from "react"

function makeValidateSamples(base: string) {
  const url = `${base}/api/license/validate`
  return [
    {
      title: "cURL",
      lang: "bash",
      code: `curl -X POST ${url} \\
  -H "Content-Type: application/json" \\
  -d '{
    "key": "ABCD-1234-EFGH-5678",
    "hwid": "CPU-ABC123-DEF456",
    "ipAddress": "192.168.1.100"
  }'`,
    },
    {
      title: "JavaScript (Fetch)",
      lang: "javascript",
      code: `const response = await fetch("${url}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    key: "ABCD-1234-EFGH-5678",
    hwid: "CPU-ABC123-DEF456",
    ipAddress: "192.168.1.100"
  }),
})

const data = await response.json()
console.log(data)`,
    },
    {
      title: "Node.js (Axios)",
      lang: "javascript",
      code: `import axios from "axios"

const response = await axios.post("${url}", {
  key: "ABCD-1234-EFGH-5678",
  hwid: "CPU-ABC123-DEF456",
  ipAddress: "192.168.1.100",
})

console.log(response.data)`,
    },
    {
      title: "Python (requests)",
      lang: "python",
      code: `import requests

response = requests.post("${url}", json={
    "key": "ABCD-1234-EFGH-5678",
    "hwid": "CPU-ABC123-DEF456",
    "ipAddress": "192.168.1.100",
})

data = response.json()
print(data)`,
    },
  ]
}

function makeStatusSamples(base: string) {
  const url = `${base}/api/license/status`
  return [
    {
      title: "cURL",
      lang: "bash",
      code: `curl -X POST ${url} \\
  -H "Content-Type: application/json" \\
  -d '{
    "key": "ABCD-1234-EFGH-5678"
  }'`,
    },
    {
      title: "JavaScript (Fetch)",
      lang: "javascript",
      code: `const response = await fetch("${url}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    key: "ABCD-1234-EFGH-5678"
  }),
})

const data = await response.json()
console.log(data)`,
    },
    {
      title: "Node.js (Axios)",
      lang: "javascript",
      code: `import axios from "axios"

const response = await axios.post("${url}", {
  key: "ABCD-1234-EFGH-5678",
})

console.log(response.data)`,
    },
    {
      title: "Python (requests)",
      lang: "python",
      code: `import requests

response = requests.post("${url}", json={
    "key": "ABCD-1234-EFGH-5678",
})

data = response.json()
print(data)`,
    },
  ]
}

const sections = [
  { id: "endpoint", label: "Endpoint", icon: "endpoint" },
  { id: "request-body", label: "Request Body", icon: "request" },
  { id: "success-response", label: "Success Response", icon: "success" },
  { id: "error-responses", label: "Error Responses", icon: "error" },
  { id: "status-api", label: "Status Check API", icon: "heart" },
  { id: "code-examples", label: "Code Examples", icon: "code" },
]

function SvgIcon({ name, size = 18 }: { name: string; size?: number }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
  switch (name) {
    case "shield":
      return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
    case "endpoint":
      return <svg {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    case "request":
      return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
    case "success":
      return <svg {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
    case "error":
      return <svg {...props}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
    case "code":
      return <svg {...props}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
    case "arrow-left":
      return <svg {...props}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
    case "sun":
      return <svg {...props}><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
    case "moon":
      return <svg {...props}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
    case "copy":
      return <svg {...props}><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
    case "check":
      return <svg {...props}><polyline points="20 6 9 17 4 12" /></svg>
    case "heart":
      return <svg {...props}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
    default:
      return null
  }
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button className="copy-btn" onClick={copy} aria-label="Copy code">
      <SvgIcon name={copied ? "check" : "copy"} size={14} />
      {copied ? "Copied!" : "Copy"}
    </button>
  )
}

export default function DocsPage() {
  const [dark, setDark] = useState(true)
  const [activeSection, setActiveSection] = useState("endpoint")
  const [validateSamples, setValidateSamples] = useState<ReturnType<typeof makeValidateSamples>>([])
  const [statusSamples, setStatusSamples] = useState<ReturnType<typeof makeStatusSamples>>([])
  const [copiedId, setCopiedId] = useState("")

  const copyText = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(""), 2000)
    } catch {}
  }, [])

  useEffect(() => {
    setValidateSamples(makeValidateSamples(window.location.origin))
    setStatusSamples(makeStatusSamples(window.location.origin))
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light")
  }, [dark])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: "-80px 0px -60% 0px" },
    )
    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="docs-page" data-theme={dark ? "dark" : "light"}>
      <aside className="docs-sidebar">
        <div className="sidebar-brand">
          <SvgIcon name="shield" size={22} />
          <span>API Docs</span>
        </div>
        <nav className="sidebar-nav">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`sidebar-link${activeSection === s.id ? " active" : ""}`}
            >
              <SvgIcon name={s.icon} size={16} />
              {s.label}
            </a>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button onClick={() => setDark(!dark)} className="theme-btn" aria-label="Toggle theme">
            <SvgIcon name={dark ? "sun" : "moon"} size={16} />
            {dark ? "Light" : "Dark"} Mode
          </button>
          <a href="/dashboard" className="back-link">
            <SvgIcon name="arrow-left" size={16} />
            Back to Dashboard
          </a>
        </div>
      </aside>

      <div className="docs-main">
        <div className="docs-container">
          <div className="hero">
            <div className="hero-badge">REST API</div>
            <h1 className="docs-title">License Validation API</h1>
            <p className="docs-subtitle">
              Validate license keys in real-time. Check expiry, revocation status,
              and bind to hardware ID or IP address — all through a single public endpoint.
            </p>
          </div>

          <section id="endpoint" className="docs-section">
            <h2><SvgIcon name="endpoint" size={20} />Endpoint</h2>
            <pre className="code-block">
              <code><span className="hl-method">POST</span> <span className="hl-url">/api/license/validate</span></code>
            </pre>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
              This endpoint is public — no authentication required.
            </p>
          </section>

          <section id="request-body" className="docs-section">
            <h2><SvgIcon name="request" size={20} />Request Body</h2>
            <div className="table-wrap">
              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>key</code></td>
                    <td>string</td>
                    <td className="tag-yes">Yes</td>
                    <td>The license key to validate</td>
                  </tr>
                  <tr>
                    <td><code>hwid</code></td>
                    <td>string</td>
                    <td className="tag-no">No</td>
                    <td>Hardware ID for device binding. Auto-saved on first activation.</td>
                  </tr>
                  <tr>
                    <td><code>ipAddress</code></td>
                    <td>string</td>
                    <td className="tag-no">No</td>
                    <td>IP address for network binding. Auto-saved on first activation.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="success-response" className="docs-section">
            <h2><SvgIcon name="success" size={20} />Success Response <span className="tag-200">200</span></h2>
            <div className="code-block-wrap">
              <CopyButton code={`{\n  "valid": true,\n  "data": {\n    "key": "ABCD-1234-EFGH-5678",\n    "plan": "Pro",\n    "status": "active",\n    "issuedAt": "2025-01-01T00:00:00.000Z",\n    "expiresAt": "2026-12-31T23:59:59.000Z"\n  }\n}`} />
              <pre className="code-block">
                <code>{`{
  "valid": true,
  "data": {
    "key": "ABCD-1234-EFGH-5678",
    "plan": "Pro",
    "status": "active",
    "issuedAt": "2025-01-01T00:00:00.000Z",
    "expiresAt": "2026-12-31T23:59:59.000Z"
  }
}`}</code>
              </pre>
            </div>
          </section>

          <section id="error-responses" className="docs-section">
            <h2><SvgIcon name="error" size={20} />Error Responses</h2>
            <div className="table-wrap">
              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Code</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><span className="tag-400">400</span></td><td><code>missing_key</code></td><td>No key field provided in request body</td></tr>
                  <tr><td><span className="tag-404">404</span></td><td><code>not_found</code></td><td>License key does not exist</td></tr>
                  <tr><td><span className="tag-403">403</span></td><td><code>revoked</code></td><td>License key has been revoked</td></tr>
                  <tr><td><span className="tag-410">410</span></td><td><code>expired</code></td><td>License key has expired</td></tr>
                  <tr><td><span className="tag-409">409</span></td><td><code>hwid_mismatch</code></td><td>Hardware ID does not match the registered device</td></tr>
                  <tr><td><span className="tag-409">409</span></td><td><code>ip_mismatch</code></td><td>IP address does not match the registered network</td></tr>
                  <tr><td><span className="tag-500">500</span></td><td><code>server_error</code></td><td>Internal server error</td></tr>
                  <tr><td><span className="tag-503">503</span></td><td><code>maintenance</code></td><td>Service is under maintenance — try again later</td></tr>
                </tbody>
              </table>
            </div>
            <p className="docs-note">
              All errors follow the shape: <code>{`{ valid: false, error: "...", message: "..." }`}</code>
            </p>
          </section>

          <section id="status-api" className="docs-section">
            <h2><SvgIcon name="heart" size={20} />Status Check API</h2>
            <p className="section-desc">
              Lightweight endpoint for polling — check if a license key is still active. No HWID/IP binding.
              Ideal for client apps that need to verify license status every few minutes.
            </p>

            <h3>Endpoint</h3>
            <div className="endpoint-box">
              <span className="method-tag method-post">POST</span>
              <code className="endpoint-url">/api/license/status</code>
            </div>

            <h3>Request Body</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>key</code></td>
                    <td>string</td>
                    <td><span className="status-tag tag-required">Yes</span></td>
                    <td>The license key to check</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>Response</h3>
            <div className="code-block">
              <button className="copy-btn" onClick={() => copyText(`{\n  "valid": true,\n  "status": "active",\n  "plan": "Pro",\n  "expiresAt": "2027-12-31"\n}`, "status-resp")}>
                <SvgIcon name={copiedId === "status-resp" ? "check" : "copy"} size={14} />
                {copiedId === "status-resp" ? "Copied!" : "Copy"}
              </button>
              <pre><code>{`// Success
{
  "valid": true,           // false if expired/revoked
  "status": "active",      // "active" | "expired" | "revoked" | "not_found"
  "plan": "Pro",
  "expiresAt": "2027-12-31"
}

// Failed
{
  "valid": false,
  "status": "expired",
  "message": "License key has expired"
}`}</code></pre>
            </div>

            <h3>Code Examples</h3>
            <div className="examples-grid">
              {statusSamples.map((sample) => (
                <div key={sample.title} className="docs-example">
                  <div className="example-header">
                    <span className="lang-tag">{sample.lang}</span>
                    <span className="example-title">{sample.title}</span>
                  </div>
                  <div className="code-block">
                    <button className="copy-btn" onClick={() => copyText(sample.code, `status-${sample.title}`)}>
                      <SvgIcon name={copiedId === `status-${sample.title}` ? "check" : "copy"} size={14} />
                      {copiedId === `status-${sample.title}` ? "Copied!" : "Copy"}
                    </button>
                    <pre><code>{sample.code}</code></pre>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="code-examples" className="docs-section">
            <h2><SvgIcon name="code" size={20} />Code Examples</h2>
            <div className="examples-grid">
              {validateSamples.map((sample) => (
                <div key={sample.title} className="docs-example">
                  <div className="example-header">
                    <span className="lang-tag">{sample.lang}</span>
                    <span className="example-title">{sample.title}</span>
                  </div>
                  <div className="code-block">
                    <button className="copy-btn" onClick={() => copyText(sample.code, `validate-${sample.title}`)}>
                      <SvgIcon name={copiedId === `validate-${sample.title}` ? "check" : "copy"} size={14} />
                      {copiedId === `validate-${sample.title}` ? "Copied!" : "Copy"}
                    </button>
                    <pre><code>{sample.code}</code></pre>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        .docs-page {
          display: flex;
          min-height: 100vh;
          font-family: "DM Sans", system-ui, sans-serif;
          --bg-page: #09090b;
          --bg-sidebar: #0c0c0e;
          --bg-card: #121214;
          --bg-code: #18181b;
          --border: #1f1f23;
          --border-hover: #2f2f35;
          --text-primary: #f4f4f5;
          --text-secondary: #71717a;
          --text-body: #d4d4d8;
          --brand: #f5b342;
          --brand-glow: rgba(245, 179, 66, 0.08);
          transition: background 0.25s, color 0.25s;
          background: var(--bg-page);
          color: var(--text-body);
        }
        .docs-page[data-theme="light"] {
          --bg-page: #f8f8fa;
          --bg-sidebar: #ffffff;
          --bg-card: #ffffff;
          --bg-code: #f1f1f3;
          --border: #e4e4e7;
          --border-hover: #d4d4d8;
          --text-primary: #18181b;
          --text-secondary: #71717a;
          --text-body: #3f3f46;
          --brand-glow: rgba(245, 179, 66, 0.12);
        }

        /* ─── Sidebar ─── */
        .docs-sidebar {
          width: 240px;
          flex-shrink: 0;
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 1.5rem 0;
          position: sticky;
          top: 0;
          height: 100vh;
        }
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0 1.25rem 1.25rem;
          font-family: "Outfit", sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border);
          margin-bottom: 0.75rem;
          letter-spacing: -0.01em;
        }
        .sidebar-brand svg {
          color: var(--brand);
        }
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0 0.5rem;
          flex: 1;
          overflow-y: auto;
        }
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.15s;
          position: relative;
        }
        .sidebar-link:hover {
          background: var(--brand-glow);
          color: var(--text-primary);
        }
        .sidebar-link.active {
          background: var(--brand-glow);
          color: var(--brand);
        }
        .sidebar-link.active::before {
          content: "";
          position: absolute;
          left: -0.5rem;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 18px;
          border-radius: 0 3px 3px 0;
          background: var(--brand);
        }
        .sidebar-footer {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem 1.25rem 0;
          border-top: 1px solid var(--border);
          margin-top: 0.75rem;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.15s;
        }
        .back-link:hover {
          color: var(--brand);
        }
        .theme-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-secondary);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
          transition: color 0.15s;
        }
        .theme-btn:hover {
          color: var(--brand);
        }

        /* ─── Main content ─── */
        .docs-main {
          flex: 1;
          min-width: 0;
        }
        .docs-container {
          padding: 3rem 3rem 5rem;
        }

        /* Hero */
        .hero {
          margin-bottom: 3.5rem;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.65rem;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-radius: 6px;
          background: var(--brand-glow);
          color: var(--brand);
          border: 1px solid color-mix(in srgb, var(--brand) 20%, transparent);
          margin-bottom: 1rem;
        }
        .docs-title {
          font-family: "Outfit", sans-serif;
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 0.75rem;
          letter-spacing: -0.02em;
          line-height: 1.15;
        }
        .docs-subtitle {
          color: var(--text-secondary);
          margin: 0;
          font-size: 1.05rem;
          line-height: 1.7;
          max-width: 600px;
        }

        /* Sections */
        .docs-section {
          margin-bottom: 3rem;
          scroll-margin-top: 1.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.5rem 1.75rem;
          transition: border-color 0.2s;
        }
        .docs-section:hover {
          border-color: var(--border-hover);
        }
        .docs-section h2 {
          font-family: "Outfit", sans-serif;
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          letter-spacing: -0.01em;
        }
        .docs-section h2 svg {
          color: var(--brand);
        }

        /* Tags */
        .tag-200, .tag-400, .tag-403, .tag-404, .tag-409, .tag-410, .tag-500, .tag-503 {
          display: inline-block;
          padding: 0.125rem 0.45rem;
          border-radius: 5px;
          font-size: 0.75rem;
          font-weight: 700;
          font-family: monospace;
          letter-spacing: -0.02em;
        }
        .tag-200 { background: rgba(34, 197, 94, 0.12); color: #22c55e; }
        .tag-400 { background: rgba(251, 146, 60, 0.12); color: #fb923c; }
        .tag-403 { background: rgba(239, 68, 68, 0.12); color: #ef4444; }
        .tag-404 { background: rgba(251, 146, 60, 0.12); color: #fb923c; }
        .tag-409 { background: rgba(239, 68, 68, 0.12); color: #ef4444; }
        .tag-410 { background: rgba(239, 68, 68, 0.12); color: #ef4444; }
        .tag-500 { background: rgba(239, 68, 68, 0.12); color: #ef4444; }
        .tag-503 { background: rgba(245, 179, 66, 0.12); color: #f5b342; }

        /* Code blocks */
        .code-block-wrap {
          position: relative;
        }
        .code-block {
          background: var(--bg-code);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 1.1rem 1.25rem;
          overflow-x: auto;
          font-size: 0.85rem;
          line-height: 1.65;
          margin: 0;
        }
        .code-block code {
          color: var(--text-body);
        }
        .hl-method {
          color: #22c55e;
          font-weight: 600;
        }
        .hl-url {
          color: var(--brand);
        }
        .copy-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.3rem 0.6rem;
          font-size: 0.7rem;
          font-weight: 500;
          color: var(--text-secondary);
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 6px;
          cursor: pointer;
          font-family: inherit;
          opacity: 0;
          transition: opacity 0.15s, background 0.15s, color 0.15s;
        }
        .code-block-wrap:hover .copy-btn {
          opacity: 1;
        }
        .copy-btn:hover {
          background: color-mix(in srgb, var(--brand) 12%, var(--bg-card));
          color: var(--brand);
          border-color: color-mix(in srgb, var(--brand) 30%, var(--border));
        }

        /* Table */
        .table-wrap {
          overflow-x: auto;
        }
        .docs-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        .docs-table th,
        .docs-table td {
          text-align: left;
          padding: 0.65rem 0.75rem;
          border-bottom: 1px solid var(--border);
        }
        .docs-table th {
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .docs-table td {
          color: var(--text-body);
        }
        .docs-table tr:last-child td {
          border-bottom: none;
        }
        .docs-table code {
          background: color-mix(in srgb, var(--text-secondary) 12%, transparent);
          padding: 0.125rem 0.375rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }
        .tag-yes {
          color: #22c55e;
          font-weight: 600;
        }
        .tag-no {
          color: var(--text-secondary);
        }
        .docs-note {
          color: var(--text-secondary);
          font-size: 0.85rem;
          margin-top: 0.75rem;
        }

        /* Code examples grid */
        .examples-grid {
          display: grid;
          gap: 1.25rem;
        }
        .docs-example {
        }
        .example-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .example-header h3 {
          font-family: "Outfit", sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }
        .lang-tag {
          display: inline-block;
          padding: 0.125rem 0.45rem;
          border-radius: 5px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          background: color-mix(in srgb, var(--brand) 14%, transparent);
          color: var(--brand);
          font-family: monospace;
        }
      `}</style>
    </div>
  )
}
