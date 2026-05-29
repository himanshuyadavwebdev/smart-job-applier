import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/db"
import { User } from "@/models/User.model"
import { generateToken } from "@/lib/auth"
import { sendWelcomeEmail } from "@/services/emailService"

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email and password are required." },
        { status: 400 }
      )
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, passwordHash })

    const token = generateToken(user._id.toString())
    sendWelcomeEmail({ email: user.email, name: user.name }).catch(() => {})

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        data: { user: user.toSafeObject(), token },
      },
      { status: 201 }
    )
  } catch (err) {
    console.error("Register error:", err)
    return NextResponse.json(
      { success: false, message: "Server error. Please try again later." },
      { status: 500 }
    )
  }
}
