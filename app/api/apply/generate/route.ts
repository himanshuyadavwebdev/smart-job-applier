import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"
import { Application } from "@/models/Application.model"
import { Job } from "@/models/Job.model"
import { Resume } from "@/models/Resume.model"
import { User } from "@/models/User.model"
import { generateApplicationDocs } from "@/services/aiService"

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

    const [job, resume, dbUser] = await Promise.all([
      Job.findById(jobId),
      Resume.findOne({ userId: user._id, isActive: true }),
      User.findById(user._id).select("-passwordHash"),
    ])

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found." },
        { status: 404 }
      )
    }
    if (!resume) {
      return NextResponse.json(
        {
          success: false,
          message: "No active resume found. Please upload your resume first.",
        },
        { status: 404 }
      )
    }

    let application = await Application.findOneAndUpdate(
      { userId: user._id, jobId },
      {
        $set: {
          resumeId: resume._id,
          status: "generating",
        },
      },
      { upsert: true, new: true }
    )

    const userProfile = {
      name: dbUser?.name,
      preferences: dbUser?.preferences,
      classification: resume.classification,
    }

    const docs = await generateApplicationDocs(resume.rawText, job.description, userProfile)

    application = await Application.findByIdAndUpdate(
      application._id,
      {
        $set: {
          tailoredResumeText: docs.tailoredResumeText,
          coverLetter: docs.coverLetter,
          emailDraft: docs.emailDraft,
          status: "previewing",
        },
      },
      { new: true }
    )

    return NextResponse.json({
      success: true,
      message: "Application documents generated.",
      data: {
        applicationId: application?._id,
        tailoredResumeText: docs.tailoredResumeText,
        coverLetter: docs.coverLetter,
        emailDraft: docs.emailDraft,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error"
    const status = msg === "Unauthorized" || msg === "Invalid token" ? 401 : 500
    return NextResponse.json({ success: false, message: msg }, { status })
  }
}
