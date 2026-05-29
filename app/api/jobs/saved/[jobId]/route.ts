import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"
import { Application } from "@/models/Application.model"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    await connectDB()
    const { user } = await verifyAuth(request)
    const { jobId } = await params

    const result = await Application.findOneAndDelete({
      userId: user._id,
      jobId,
      status: "saved",
    })

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Saved job not found." },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: "Job removed from saved list." })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error"
    const status = msg === "Unauthorized" || msg === "Invalid token" ? 401 : 500
    return NextResponse.json({ success: false, message: msg }, { status })
  }
}
