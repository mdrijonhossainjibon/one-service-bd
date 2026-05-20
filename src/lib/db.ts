import { connectDB } from "@/lib/mongodb"
import { User, LicenseKey, ActivityLog } from "@/models"
import bcrypt from "bcryptjs"

export type UserRole = "superadmin" | "admin" | "user"

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getUsers() {
  await connectDB()
  const users = await User.find().sort({ createdAt: -1 }).lean()

  return users.map((u) => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    password: u.password,
    avatar: u.avatar,
    role: u.role as UserRole,
    status: u.status,
    hwid: u.hwid,
    ipAddress: u.ipAddress,
    createdAt: u.joinedAt ? new Date(u.joinedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
  }))
}

export async function getUserByEmail(email: string) {
  await connectDB()
  const u = await User.findOne({ email: email.toLowerCase() }).lean()
  if (!u) return null

  return {
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    password: u.password,
    avatar: u.avatar,
    role: u.role as UserRole,
    status: u.status,
    hwid: u.hwid,
    ipAddress: u.ipAddress,
    createdAt: u.joinedAt ? new Date(u.joinedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
  }
}

export async function getUserById(id: string) {
  await connectDB()
  // Return null for non-ObjectId values (e.g. Google OAuth UUIDs)
  if (!/^[a-f\d]{24}$/i.test(id)) return null
  const u = await User.findById(id).lean()
  if (!u) return null

  return {
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    password: u.password,
    avatar: u.avatar,
    role: u.role as UserRole,
    status: u.status,
    hwid: u.hwid,
    ipAddress: u.ipAddress,
    createdAt: u.joinedAt ? new Date(u.joinedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
  }
}

export async function createUser(data: {
  name: string
  email: string
  password: string
  role?: UserRole
}) {
  await connectDB()
  const hashedPassword = await bcrypt.hash(data.password, 12)

  const u = await User.create({
    name: data.name,
    email: data.email.toLowerCase(),
    password: hashedPassword,
    role: data.role ?? "user",
  })

  return {
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    password: u.password,
    avatar: u.avatar,
    role: u.role as UserRole,
    status: u.status,
    hwid: u.hwid,
    ipAddress: u.ipAddress,
    createdAt: u.joinedAt ? new Date(u.joinedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
  }
}

export async function updateUserRole(id: string, role: UserRole) {
  await connectDB()
  await User.findByIdAndUpdate(id, { role })
}

export async function updateUser(id: string, updates: Record<string, string>) {
  await connectDB()
  await User.findByIdAndUpdate(id, updates)
}

export async function banUser(id: string) {
  await connectDB()
  const u = await User.findById(id)
  if (!u) return
  u.status = u.status === "banned" ? "active" : "banned"
  await u.save()
}

export async function deleteUser(id: string) {
  await connectDB()
  await User.findByIdAndDelete(id)
}

// ─── License Keys ────────────────────────────────────────────────────────────

export async function getLicenseKeys() {
  await connectDB()
  const keys = await LicenseKey.find()
    .sort({ createdAt: -1 })
    .populate<{ userId: { _id: string; name: string } | null }>("userId", "name")
    .lean()

  return keys.map((k) => ({
    id: k._id.toString(),
    key: k.key,
    plan: k.plan,
    status: k.status,
    createdAt: k.createdAt.toISOString().split("T")[0],
    expires: k.expiresAt.toISOString().split("T")[0],
    userId: k.userId?._id?.toString() ?? null,
    assignedTo: k.assignedTo ?? "Unassigned",
    hwid: k.hwid,
    ipAddress: k.ipAddress,
  }))
}

export async function getAllLicenseKeys() {
  return getLicenseKeys()
}

export async function getLicenseKeysByUser(userId: string) {
  await connectDB()
  const keys = await LicenseKey.find({ userId }).sort({ createdAt: -1 }).lean()

  return keys.map((k) => ({
    id: k._id.toString(),
    key: k.key,
    plan: k.plan,
    status: k.status,
    createdAt: k.createdAt.toISOString().split("T")[0],
    expires: k.expiresAt.toISOString().split("T")[0],
    userId: k.userId?.toString() ?? null,
    assignedTo: k.assignedTo ?? "",
    hwid: k.hwid,
    ipAddress: k.ipAddress,
  }))
}

export async function createLicenseKey(data: {
  key: string
  plan: string
  expiresAt: Date
  assignedTo?: string | null
}) {
  await connectDB()
  const k = await LicenseKey.create({
    key: data.key,
    plan: data.plan,
    status: "active",
    assignedTo: data.assignedTo ?? null,
    expiresAt: data.expiresAt,
  })

  return {
    id: k._id.toString(),
    key: k.key,
    plan: k.plan,
    status: k.status,
    createdAt: k.createdAt.toISOString().split("T")[0],
    expires: k.expiresAt.toISOString().split("T")[0],
    userId: k.userId?.toString() ?? null,
    assignedTo: k.assignedTo ?? "",
    hwid: k.hwid,
    ipAddress: k.ipAddress,
  }
}

export async function assignLicenseKey(keyId: string, userId: string) {
  await connectDB()
  await LicenseKey.findByIdAndUpdate(keyId, { userId, status: "active" })
}

export async function revokeLicenseKey(id: string) {
  await connectDB()
  await LicenseKey.findByIdAndUpdate(id, { status: "revoked" })
}

export async function resetLicenseKey(id: string, newKey: string) {
  await connectDB()
  await LicenseKey.findByIdAndUpdate(id, {
    key: newKey,
    status: "active",
  })
}

export async function deleteLicenseKey(id: string) {
  await connectDB()
  await LicenseKey.findByIdAndDelete(id)
}

// ─── Activity Logs ───────────────────────────────────────────────────────────

export async function getActivityLogs(limit = 50) {
  await connectDB()
  const logs = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()

  return logs.map((l) => ({
    id: l._id.toString(),
    user: l.user,
    action: l.action,
    details: l.details,
    type: l.type,
    timestamp: l.createdAt.toISOString().replace("T", " ").split(".")[0],
  }))
}

export async function logActivity(data: {
  user: string
  action: string
  details?: string
  type?: "info" | "warning" | "error" | "success"
}) {
  await connectDB()
  await ActivityLog.create({
    user: data.user,
    action: data.action,
    details: data.details ?? "",
    type: data.type ?? "info",
  })
}

export async function validateLicenseKey(key: string, hwid?: string, ipAddress?: string) {
  await connectDB()

  const license = await LicenseKey.findOne({ key }).lean()
  if (!license) {
    return { valid: false, error: "not_found", message: "License key not found" }
  }

  if (license.status === "revoked") {
    return { valid: false, error: "revoked", message: "License key has been revoked" }
  }

  if (license.expiresAt < new Date()) {
    return { valid: false, error: "expired", message: "License key has expired" }
  }

  if (license.status === "expired") {
    return { valid: false, error: "expired", message: "License key has expired" }
  }

  if (hwid && license.hwid && license.hwid !== hwid) {
    return { valid: false, error: "hwid_mismatch", message: "Hardware ID does not match" }
  }

  if (ipAddress && license.ipAddress && license.ipAddress !== ipAddress) {
    return { valid: false, error: "ip_mismatch", message: "IP address does not match" }
  }

  const updateFields: Record<string, unknown> = {}
  if (!license.hwid && hwid) updateFields.hwid = hwid
  if (!license.ipAddress && ipAddress) updateFields.ipAddress = ipAddress

  if (Object.keys(updateFields).length > 0) {
    await LicenseKey.findByIdAndUpdate(license._id, updateFields)
  }

  return {
    valid: true,
    data: {
      key: license.key,
      plan: license.plan,
      status: license.status,
      issuedAt: license.issuedAt,
      expiresAt: license.expiresAt,
    },
  }
}

export async function updateLicenseKey(id: string, data: Record<string, unknown>) {
  await connectDB()
  const update: Record<string, unknown> = {}
  if (data.assignedTo) update.assignedTo = data.assignedTo
  if (data.plan) update.plan = data.plan
  if (data.status) update.status = data.status
  if (data.expires && data.expires !== "Never") update.expiresAt = new Date(data.expires as string)
  try {
    const result = await LicenseKey.findByIdAndUpdate(id, update, { new: true })
    if (!result) console.error(`LicenseKey ${id} not found for update`)
    return result
  } catch (err) {
    console.error(`updateLicenseKey error:`, err)
    throw err
  }
}
