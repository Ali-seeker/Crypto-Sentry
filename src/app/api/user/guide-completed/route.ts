import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { logger } from "@/lib/logger"

export async function PATCH() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { guide_completed: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("UserAPI", "Failed to update guide_completed", { error: (error as Error).message })
    return NextResponse.json(
      { error: "Failed to update guide completion status", code: "GUIDE_UPDATE_FAILED" },
      { status: 500 }
    )
  }
}
