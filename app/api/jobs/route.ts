import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"
import { User } from "@/models/User.model"
import { Resume } from "@/models/Resume.model"
import { Job } from "@/models/Job.model"
import { Application } from "@/models/Application.model"
import { fetchJobs } from "@/services/jobFetchService"
import { rankJobs } from "@/services/matchingService"

export async function GET(request: Request) {
  try {
    await connectDB()
    const { user } = await verifyAuth(request)

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"))

    const dbUser = await User.findById(user._id)
    const resume = await Resume.findOne({ userId: user._id, isActive: true })

    const preferences = {
      ...dbUser.preferences.toObject(),
      ...(searchParams.get("role") && { desiredRole: searchParams.get("role") }),
      ...(searchParams.get("location") && {
        preferredLocations: [searchParams.get("location")],
      }),
      ...(searchParams.get("jobType") && { jobType: [searchParams.get("jobType")] }),
      ...(searchParams.get("salaryMin") && {
        salaryMin: parseInt(searchParams.get("salaryMin")!),
      }),
    }

    const rawJobs = await fetchJobs(preferences)
    const rankedJobs = rankJobs(rawJobs, resume, preferences)

    const total = rankedJobs.length
    const start = (page - 1) * limit
    const paged = rankedJobs.slice(start, start + limit)

    const savedApps = await Application.find({
      userId: user._id,
      status: "saved",
    }).select("jobId")
    const savedIds = new Set(savedApps.map((a) => String(a.jobId)))

    const jobsWithStatus = paged.map((job) => ({
      ...job,
      isSaved: savedIds.has(String((job as Record<string, unknown>)._id)),
    }))

    return NextResponse.json({
      success: true,
      data: {
        jobs: jobsWithStatus,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error"
    const status = msg === "Unauthorized" || msg === "Invalid token" ? 401 : 500
    return NextResponse.json({ success: false, message: msg }, { status })
  }
}
