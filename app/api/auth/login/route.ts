import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { User } from "@/models/User.model"
import { generateToken } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      )
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      )
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      )
    }

    const token = generateToken(user._id.toString())

    return NextResponse.json({
      success: true,
      message: "Login successful.",
      data: { user: user.toSafeObject(), token },
    })
  } catch (err) {
    console.error("Login error:", err)
    return NextResponse.json(
      { success: false, message: "Server error. Please try again later." },
      { status: 500 }
    )
  }
}
