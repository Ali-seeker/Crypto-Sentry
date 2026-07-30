import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? parseInt(limitParam, 10) : 50

    const alerts = await prisma.cryptoAlert.findMany({
      orderBy: { detected_at: "desc" },
      take: isNaN(limit) ? 50 : limit,
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error("Alerts GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
