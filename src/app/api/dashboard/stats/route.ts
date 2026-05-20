import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User, LicenseKey, ActivityLog } from "@/models"

export async function GET() {
  await connectDB()

  // ── User stats ──
  const totalUsers = await User.countDocuments()
  const activeUsers = await User.countDocuments({ status: "active" })

  // ── License stats ──
  const totalLicenses = await LicenseKey.countDocuments()
  const activeLicenses = await LicenseKey.countDocuments({ status: "active" })
  const expiredLicenses = await LicenseKey.countDocuments({ status: "expired" })
  const revokedLicenses = await LicenseKey.countDocuments({ status: "revoked" })
  const trialLicenses = await LicenseKey.countDocuments({ status: "used" })

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const licenseTrends = await LicenseKey.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        total: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
        },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ])

  const trends = licenseTrends.map((t) => ({
    label: monthNames[t._id.month - 1],
    active: t.active,
    new: t.total,
  }))

  if (trends.length === 0) {
    // no data yet — return empty months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      trends.push({ label: monthNames[d.getMonth()], active: 0, new: 0 })
    }
  }

  // ── Recent activity ──
  const recentLogs = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(8)
    .lean()

  const activity = recentLogs.map((l) => ({
    id: l._id.toString(),
    user: l.user,
    action: l.action,
    details: l.details,
    type: l.type,
    timestamp: l.createdAt.toISOString().replace("T", " ").split(".")[0],
  }))

  return NextResponse.json({
    users: { total: totalUsers, active: activeUsers },
    licenses: {
      total: totalLicenses,
      active: activeLicenses,
      expired: expiredLicenses,
      revoked: revokedLicenses,
      trial: trialLicenses,
    },
    trends,
    activity,
  })
}
