import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { asset_id } = await req.json()
    if (!asset_id || typeof asset_id !== "string") {
      return NextResponse.json({ error: "asset_id is required" }, { status: 400 })
    }

    // Upsert to handle idempotency (if someone else already added it, we just ignore or update nothing)
    // Wait, the requirement says "Create the row with added_by: session.user.id. Keep the existing duplicate-check/idempotent-success behavior."
    // If it already exists, it will throw a unique constraint error if we just use create. 
    // We can use upsert to cleanly handle it.
    await prisma.monitoredAsset.upsert({
      where: { asset_id },
      update: {}, // Do nothing if it already exists
      create: { 
        asset_id,
        added_by: session.user.id
      },
    })

    return NextResponse.json({ success: true, message: "Asset added to surveillance engine" })
  } catch (error: any) {
    console.error("Monitored Asset Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
