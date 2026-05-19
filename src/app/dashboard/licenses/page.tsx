import { requireRole } from "@/lib/auth-utils"
import { getLicenseKeys } from "@/lib/db"
import LicensesClient from "./client"

export default async function LicensesPage() {
  await requireRole("admin")
  const raw = await getLicenseKeys()

  const initialLicenses = raw.map((l) => ({
    id: l.id,
    key: l.key,
    assignedTo: l.assignedTo,
    plan: l.plan,
    status: l.status,
    expires: l.expires === "2100-01-01" ? "Never" : l.expires,
    hwid: l.hwid,
    ipAddress: l.ipAddress,
  }))

  return <LicensesClient initialLicenses={initialLicenses} />
}
