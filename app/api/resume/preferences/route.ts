import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"
import { User } from "@/models/User.model"

export async function PUT(request: Request) {
  try {
    await connectDB()
    const { user } = await verifyAuth(request)

    const body = await request.json()
    const {
      desiredRole,
      experienceLevel,
      targetLevel,
      salaryMin,
      salaryMax,
      currency,
      jobType,
      preferredLocations,
      techStack,
    } = body

    const updated = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          "preferences.desiredRole": desiredRole,
          "preferences.experienceLevel": experienceLevel,
          "preferences.targetLevel": targetLevel,
          "preferences.salaryMin": salaryMin,
          "preferences.salaryMax": salaryMax,
          "preferences.currency": currency || "USD",
          "preferences.jobType": jobType || [],
          "preferences.preferredLocations": preferredLocations || [],
          "preferences.techStack": techStack || [],
        },
      },
      { new: true, runValidators: true }
    ).select("-passwordHash")

    return NextResponse.json({
      success: true,
      message: "Preferences updated successfully.",
      data: updated?.preferences,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error"
    const status = msg === "Unauthorized" || msg === "Invalid token" ? 401 : 500
    return NextResponse.json({ success: false, message: msg }, { status })
  }
}
