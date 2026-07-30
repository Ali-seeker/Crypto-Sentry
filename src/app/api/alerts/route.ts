import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { logger } from "@/lib/logger"

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
    logger.error("AlertsAPI", "Alerts GET error", { error: (error as Error).message })
    return NextResponse.json({ error: "Failed to fetch alerts", code: "ALERTS_FETCH_FAILED" }, { status: 500 })
  }
}
