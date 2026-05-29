import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"
import { Resume } from "@/models/Resume.model"
import { getATSScore } from "@/services/aiService"

export async function POST(request: Request) {
  try {
    await connectDB()
    const { user } = await verifyAuth(request)

    const body = await request.json()
    const { jobDescription } = body

    if (!jobDescription) {
      return NextResponse.json(
        { success: false, message: "Job description is required." },
        { status: 400 }
      )
    }

    const resume = await Resume.findOne({ userId: user._id, isActive: true })
    if (!resume) {
      return NextResponse.json(
        { success: false, message: "No active resume found." },
        { status: 404 }
      )
    }

    const result = await getATSScore(resume.rawText, jobDescription)

    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error"
    const status = msg === "Unauthorized" || msg === "Invalid token" ? 401 : 500
    return NextResponse.json({ success: false, message: msg }, { status })
  }
}
