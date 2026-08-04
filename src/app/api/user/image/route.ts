import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { image } = await req.json()

    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 })
    }

    // Update the user's image in the database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update profile picture:", error)
    return NextResponse.json({ error: "Failed to update profile picture" }, { status: 500 })
  }
}
