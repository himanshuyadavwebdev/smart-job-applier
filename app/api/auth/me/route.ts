import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"
import { Resume } from "@/models/Resume.model"

export async function GET(request: Request) {
  try {
    await connectDB()
    const { user } = await verifyAuth(request)

    const userObj = user.toObject ? user.toObject() : user
    delete userObj.passwordHash

    const activeResume = await Resume.findOne({ userId: user._id, isActive: true })

    return NextResponse.json({
      success: true,
      data: { user: userObj, resume: activeResume || null },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized"
    return NextResponse.json({ success: false, message }, { status: 401 })
  }
}
