import { config } from "dotenv"
config({ path: `${process.cwd()}/.env.local` })

let connectDB: typeof import("../lib/mongodb").connectDB
let User: typeof import("../models").User
let LicenseKey: typeof import("../models").LicenseKey
let ActivityLog: typeof import("../models").ActivityLog
import bcrypt from "bcryptjs"

async function seed() {
  console.log("Seeding database...")

  // Dynamic imports after dotenv loads .env.local
  const mongo = await import("../lib/mongodb")
  const models = await import("../models")
  connectDB = mongo.connectDB
  User = models.User
  LicenseKey = models.LicenseKey
  ActivityLog = models.ActivityLog

  await connectDB()

  // Clean existing data
  await Promise.all([
    User.deleteMany({}),
    LicenseKey.deleteMany({}),
    ActivityLog.deleteMany({}),
  ])

  // Create seed users with roles
  const adminPassword = await bcrypt.hash("password123", 12)

  const superAdmin = await User.create({
    name: "Super Admin",
    email: "superadmin@example.com",
    password: adminPassword,
    role: "superadmin",
    status: "active",
  })

  const admin = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: adminPassword,
    role: "admin",
    status: "active",
  })

  const john = await User.create({
    name: "John Doe",
    email: "john@example.com",
    password: adminPassword,
    role: "user",
    status: "active",
    hwid: "HWID-A1B2-C3D4-E5F6",
    ipAddress: "192.168.1.50",
  })

  const jane = await User.create({
    name: "Jane Smith",
    email: "jane@example.com",
    password: adminPassword,
    role: "user",
    status: "active",
    hwid: "HWID-G7H8-I9J0-K1L2",
    ipAddress: "192.168.1.75",
  })

  const bob = await User.create({
    name: "Bob Wilson",
    email: "bob@example.com",
    password: adminPassword,
    role: "user",
    status: "active",
    hwid: "HWID-M3N4-O5P6-Q7R8",
    ipAddress: "10.0.0.25",
  })

  const alice = await User.create({
    name: "Alice Brown",
    email: "alice@example.com",
    password: adminPassword,
    role: "user",
    status: "active",
    hwid: "",
    ipAddress: "",
  })

  console.log(`Created ${6} users with roles (superadmin, admin, user)`)

  // Create seed license keys with HWID/IP tracking
  const now = new Date()
  const licenses = await LicenseKey.insertMany([
    {
      key: "ABCD-1234-EFGH-5678",
      plan: "Pro",
      status: "active",
      userId: john._id,
      hwid: "HWID-A1B2-C3D4-E5F6",
      ipAddress: "192.168.1.50",
      expiresAt: new Date(now.getFullYear() + 1, 11, 31),
    },
    {
      key: "IJKL-9012-MNOP-3456",
      plan: "Basic",
      status: "expired",
      userId: jane._id,
      hwid: "HWID-G7H8-I9J0-K1L2",
      ipAddress: "192.168.1.75",
      expiresAt: new Date(now.getFullYear() - 1, 5, 30),
    },
    {
      key: "QRST-7890-UVWX-1234",
      plan: "Enterprise",
      status: "active",
      userId: bob._id,
      hwid: "HWID-M3N4-O5P6-Q7R8",
      ipAddress: "10.0.0.25",
      expiresAt: new Date(now.getFullYear() + 2, 2, 15),
    },
    {
      key: "YZAB-5678-CDEF-9012",
      plan: "Pro",
      status: "revoked",
      userId: alice._id,
      hwid: "",
      ipAddress: "",
      expiresAt: new Date(now.getFullYear() + 1, 8, 1),
    },
    {
      key: "GHIJ-3456-KLMN-7890",
      plan: "Basic",
      status: "active",
      userId: null,
      hwid: "",
      ipAddress: "",
      expiresAt: new Date(now.getFullYear() + 1, 10, 30),
    },
  ])

  console.log(`Created ${licenses.length} license keys`)

  // Create seed activity logs
  const logs = await ActivityLog.insertMany([
    { user: "Super Admin", action: "Database seeded with roles", details: "Successfully seeded database with role-based access control", type: "success" },
    { user: "Admin", action: "User created", details: "New user Alice Brown was created", type: "success" },
    { user: "Admin", action: "License generated", details: "License key ABCD-1234-EFGH-5678 was generated", type: "success" },
    { user: "Admin", action: "License revoked", details: "License for Jane Smith was revoked", type: "warning" },
    { user: "System", action: "Failed login attempt", details: "Failed login attempt from IP 192.168.1.100", type: "error" },
    { user: "Admin", action: "User banned", details: "User Bob Wilson was banned", type: "warning" },
    { user: "Admin", action: "License assigned", details: "License key QRST-7890-UVWX-1234 assigned to Alice Brown", type: "success" },
    { user: "Admin", action: "HWID registered", details: "HWID HWID-A1B2-C3D4-E5F6 registered for John Doe", type: "info" },
    { user: "Admin", action: "Settings updated", details: "Max failed attempts changed from 3 to 5", type: "info" },
    { user: "Admin", action: "User deleted", details: "User Charlie Wilson was deleted", type: "error" },
    { user: "System", action: "License expired", details: "License key IJKL-9012-MNOP-3456 has expired", type: "warning" },
    { user: "John Doe", action: "User login", details: "User John Doe logged in from IP 192.168.1.50", type: "info" },
    { user: "Admin", action: "License key reset", details: "License key for Alice Brown was reset", type: "success" },
    { user: "Admin", action: "User promoted to admin", details: "User Jane Smith was promoted to admin role", type: "success" },
  ])

  console.log(`Created ${logs.length} activity logs`)
  console.log("Database seeded successfully!")
  console.log("")
  console.log("Login credentials:")
  console.log("  Super Admin: superadmin@example.com / password123")
  console.log("  Admin:       admin@example.com / password123")
  console.log("  User:        john@example.com / password123")
  process.exit(0)
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
