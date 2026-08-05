import { NextResponse } from "next/server"
import { readSensitivity, writeSensitivity } from "@/lib/sensitivityFile"

export const dynamic = "force-dynamic"

export async function GET() {
  const val = await readSensitivity()
  return NextResponse.json({ threshold: val })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const raw = typeof body?.threshold === "string" ? parseFloat(body.threshold) : body?.threshold
    const applied = await writeSensitivity(typeof raw === "number" ? raw : NaN)
    return NextResponse.json({ threshold: applied, applied: true })
  } catch {
    return NextResponse.json({ error: "Invalid threshold value", code: "INVALID_THRESHOLD" }, { status: 400 })
  }
}