import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { logger } from "@/lib/logger"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limitParam = searchParams.get("limit")
    const sinceParam = searchParams.get("since")
    const assetIdParam = searchParams.get("assetId")
    const minSeverityParam = searchParams.get("minSeverity")
    const maxSeverityParam = searchParams.get("maxSeverity")
    const limit = limitParam ? parseInt(limitParam, 10) : 50

    // Fetch user's watchlist
    const watchlists = await prisma.watchlist.findMany({
      where: { user_id: session.user.id },
      select: { asset_id: true }
    })
    
    const assetIds = watchlists.map(w => w.asset_id)

    // Build filter
    const whereClause: Prisma.CryptoAlertWhereInput = {
      asset_id: { in: assetIds }
    }

    if (assetIdParam && assetIds.includes(assetIdParam)) {
      whereClause.asset_id = assetIdParam
    }

    if (sinceParam) {
      whereClause.detected_at = { gt: new Date(sinceParam) }
    }

    if (minSeverityParam || maxSeverityParam) {
      const min = minSeverityParam ? parseFloat(minSeverityParam) : 0
      const max = maxSeverityParam ? parseFloat(maxSeverityParam) : 100
      // Match drop_percentage for both positive (spike) and negative (crash)
      whereClause.AND = [
        {
          OR: [
            { drop_percentage: { gte: min, lte: max } },
            { drop_percentage: { lte: -min, gte: -max } }
          ]
        }
      ]
    }

    const alerts = await prisma.cryptoAlert.findMany({
      where: whereClause,
      orderBy: { detected_at: "desc" },
      take: isNaN(limit) ? 50 : limit,
    })

    return NextResponse.json(alerts)
  } catch (error) {
    logger.error("AlertsAPI", "Alerts GET error", { error: (error as Error).message })
    return NextResponse.json({ error: "Failed to fetch alerts", code: "ALERTS_FETCH_FAILED" }, { status: 500 })
  }
}
