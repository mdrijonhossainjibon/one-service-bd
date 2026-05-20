import { connectDB } from "./mongodb"
import { Settings } from "@/models/Settings"

let cached: boolean | null = null
let cacheTime = 0
const CACHE_TTL = 60_000 // 1 min cache

export async function isMaintenanceMode(): Promise<boolean> {
  if (cached !== null && Date.now() - cacheTime < CACHE_TTL) {
    return cached
  }
  try {
    await connectDB()
    const settings = await Settings.findOne()
    cached = settings?.maintenanceMode ?? false
    cacheTime = Date.now()
    return cached
  } catch {
    return false
  }
}
