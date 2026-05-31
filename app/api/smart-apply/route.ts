import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { runAutoApplyForUser } from "@/services/autoApplyService"

export async function POST(request: Request) {
  try {
    const { user } = await verifyAuth(request)
    const result = await runAutoApplyForUser(user._id.toString())

    return NextResponse.json({
      success: true,
      message: `Auto-apply complete. Found ${result.jobsFound} jobs, ranked ${result.jobsRanked}, auto-applied to ${result.appliedCount} top matches.`,
      data: result,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Auto-apply failed"
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
