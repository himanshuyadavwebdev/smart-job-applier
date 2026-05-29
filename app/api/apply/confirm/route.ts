import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"
import { Application } from "@/models/Application.model"
import { Job } from "@/models/Job.model"
import { Resume } from "@/models/Resume.model"
import { sendApplicationConfirmation } from "@/services/emailService"

export async function POST(request: Request) {
  try {
    await connectDB()
    const { user } = await verifyAuth(request)

    const body = await request.json()
    const { jobId, coverLetter, tailoredResumeText } = body

    if (!jobId) {
      return NextResponse.json(
        { success: false, message: "Job ID is required." },
        { status: 400 }
      )
    }

    const [job, resume] = await Promise.all([
      Job.findById(jobId),
      Resume.findOne({ userId: user._id, isActive: true }),
    ])

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found." },
        { status: 404 }
      )
    }

    const application = await Application.findOneAndUpdate(
      { userId: user._id, jobId },
      {
        $set: {
          coverLetter: coverLetter || "",
          tailoredResumeText: tailoredResumeText || "",
          status: "applied",
          appliedAt: new Date(),
        },
      },
      { new: true }
    )

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          message: "Application not found. Please generate documents first.",
        },
        { status: 404 }
      )
    }

    sendApplicationConfirmation(
      { email: user.email, name: user.name },
      {
        title: job.title,
        company: job.company,
        location: job.location,
        applyUrl: job.applyUrl,
      },
      { matchScore: application.matchScore }
    ).catch(() => {})

    return NextResponse.json({
      success: true,
      message: "Application confirmed and submitted.",
      data: { application, applyUrl: job.applyUrl },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error"
    const status = msg === "Unauthorized" || msg === "Invalid token" ? 401 : 500
    return NextResponse.json({ success: false, message: msg }, { status })
  }
}
