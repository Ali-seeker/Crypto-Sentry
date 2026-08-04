import { NextResponse } from "next/server"
import { readSensitivity, writeSensitivity } from "@/lib/sensitivityFile"

export const dynamic = "force-dynamic"

// Bridge between the Settings page's Critical Sensitivity control and the
// Express surveillance engine. The client POSTs the value here; it is written
// to the shared sensitivity store which the engine reads on every poll cycle.

export async function GET() {
  return NextResponse.json({ threshold: readSensitivity() })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const raw = typeof body?.threshold === "string" ? parseFloat(body.threshold) : body?.threshold
    const applied = writeSensitivity(typeof raw === "number" ? raw : NaN)
    return NextResponse.json({ threshold: applied, applied: true })
  } catch {
    return NextResponse.json({ error: "Invalid threshold value", code: "INVALID_THRESHOLD" }, { status: 400 })
  }
}