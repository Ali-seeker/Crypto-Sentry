import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
    }

    const id = params.id
    if (!id) {
      return NextResponse.json({ error: "ID is required", code: "INVALID_REQUEST" }, { status: 400 })
    }

    const entry = await prisma.watchlist.findUnique({
      where: { id },
    })

    if (!entry) {
      return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 })
    }

    // Authorization check
    if (entry.user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    await prisma.watchlist.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("WatchlistAPI", "Watchlist DELETE error", { error: (error as Error).message })
    return NextResponse.json({ error: "Failed to remove asset from watchlist", code: "WATCHLIST_REMOVE_FAILED" }, { status: 500 })
  }
}
