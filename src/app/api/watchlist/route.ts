import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const watchlist = await prisma.watchlist.findMany({
      where: { user_id: session.user.id },
      orderBy: { added_at: "desc" },
    })

    return NextResponse.json(watchlist)
  } catch (error) {
    console.error("Watchlist GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { asset_id, asset_name } = body

    if (!asset_id || !asset_name) {
      return NextResponse.json({ error: "asset_id and asset_name are required" }, { status: 400 })
    }

    // Check if it already exists to handle idempotency safely
    let entry = await prisma.watchlist.findUnique({
      where: {
        user_id_asset_id: {
          user_id: session.user.id,
          asset_id,
        },
      },
    })

    if (!entry) {
      entry = await prisma.watchlist.create({
        data: {
          user_id: session.user.id,
          asset_id,
          asset_name,
        },
      })
    }

    return NextResponse.json({ success: true, id: entry.id }, { status: 201 })
  } catch (error) {
    console.error("Watchlist POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
