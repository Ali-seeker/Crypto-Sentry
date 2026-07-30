import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { logger } from "@/lib/logger"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Missing email or password", code: "SIGNUP_VALIDATION_FAILED" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: "Password must be at least 8 characters", code: "SIGNUP_VALIDATION_FAILED" }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "Invalid email format", code: "SIGNUP_VALIDATION_FAILED" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ success: false, error: "User already exists", code: "SIGNUP_USER_EXISTS" }, { status: 400 })
    }

    const password_hash = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        email,
        password_hash,
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    logger.error("AuthAPI", "Signup error", { error: (error as Error).message })
    return NextResponse.json({ success: false, error: "Signup failed", code: "SIGNUP_FAILED" }, { status: 500 })
  }
}
