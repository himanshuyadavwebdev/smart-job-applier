import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"
import { Application } from "@/models/Application.model"
import { Job } from "@/models/Job.model"

export async function GET(request: Request) {
  try {
    await connectDB()
    const { user } = await verifyAuth(request)

    const saved = await Application.find({ userId: user._id, status: "saved" })
      .populate("jobId")
      .sort({ createdAt: -1 })

    return NextResponse.json({ success: true, data: saved })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error"
    const status = msg === "Unauthorized" || msg === "Invalid token" ? 401 : 500
    return NextResponse.json({ success: false, message: msg }, { status })
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const { user } = await verifyAuth(request)

    const body = await request.json()
    const { jobId } = body

    if (!jobId) {
      return NextResponse.json(
        { success: false, message: "Job ID is required." },
        { status: 400 }
      )
    }

    const job = await Job.findById(jobId)
    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found." },
        { status: 404 }
      )
    }

    const existing = await Application.findOne({ userId: user._id, jobId })
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Job already saved.", data: existing },
        { status: 409 }
      )
    }

    const application = await Application.create({
      userId: user._id,
      jobId,
      resumeId: null,
      status: "saved",
    })

    return NextResponse.json(
      { success: true, message: "Job saved.", data: application },
      { status: 201 }
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error"
    const status = msg === "Unauthorized" || msg === "Invalid token" ? 401 : 500
    return NextResponse.json({ success: false, message: msg }, { status })
  }
}
