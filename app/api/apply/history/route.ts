import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"
import { Application } from "@/models/Application.model"

export async function GET(request: Request) {
  try {
    await connectDB()
    const { user } = await verifyAuth(request)

    const applications = await Application.find({ userId: user._id })
      .populate("jobId")
      .populate("resumeId", "fileName classification.role classification.atsScore")
      .sort({ createdAt: -1 })

    return NextResponse.json({ success: true, data: applications })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error"
    const status = msg === "Unauthorized" || msg === "Invalid token" ? 401 : 500
    return NextResponse.json({ success: false, message: msg }, { status })
  }
}
