import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"
import { Resume } from "@/models/Resume.model"
import { extractText } from "@/services/resumeParserService"
import { classifyResume } from "@/services/aiService"

export async function POST(request: Request) {
  try {
    await connectDB()
    const { user } = await verifyAuth(request)

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded." },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const mimeType = file.type || "application/octet-stream"

    const rawText = await extractText(buffer, mimeType)
    if (!rawText || rawText.length < 50) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Could not extract meaningful text from the file. Please ensure the file is not scanned or image-based.",
        },
        { status: 400 }
      )
    }

    const classification = await classifyResume(rawText)

    await Resume.updateMany({ userId: user._id }, { isActive: false })

    const resume = await Resume.create({
      userId: user._id,
      fileUrl: "", // In a real app, upload to Cloudinary here
      fileName: file.name,
      rawText,
      classification,
      isActive: true,
    })

    return NextResponse.json(
      {
        success: true,
        message: "Resume uploaded and analyzed successfully.",
        data: resume,
      },
      { status: 201 }
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error"
    const status = msg === "Unauthorized" || msg === "Invalid token" ? 401 : 500
    return NextResponse.json({ success: false, message: msg }, { status })
  }
}

export async function GET(request: Request) {
  try {
    await connectDB()
    const { user } = await verifyAuth(request)

    const resume = await Resume.findOne({ userId: user._id, isActive: true })
    if (!resume) {
      return NextResponse.json(
        { success: false, message: "No active resume found. Please upload your resume." },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: resume })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized"
    const status = msg === "Unauthorized" || msg === "Invalid token" ? 401 : 500
    return NextResponse.json({ success: false, message: msg }, { status })
  }
}
