import { connectDB } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"
import { Job } from "@/models/Job.model"
import { Resume } from "@/models/Resume.model"
import { Application } from "@/models/Application.model"
import { User } from "@/models/User.model"
import { fetchJobs } from "./jobFetchService"
import { rankJobs } from "./matchingService"
import { generateApplicationDocs } from "./aiService"

export interface AutoApplyResult {
  jobsFound: number
  jobsRanked: number
  topMatches: Array<{
    jobId: string
    title: string
    company: string
    matchScore: number
    status: string
  }>
  appliedCount: number
}

export async function runAutoApplyForUser(userId: string): Promise<AutoApplyResult> {
  await connectDB()

  const user = await User.findById(userId)
  if (!user) throw new Error("User not found")

  const preferences = {
    desiredRole: user.preferences?.desiredRole || "software developer",
    preferredLocations: user.preferences?.preferredLocations || ["Remote"],
    salaryMin: user.preferences?.salaryMin || 0,
  }

  // 1. Fetch fresh jobs
  const rawJobs = await fetchJobs(preferences)

  // 2. Get active resume
  const resume = await Resume.findOne({ userId, isActive: true })

  // 3. Rank jobs
  const ranked = rankJobs(rawJobs, resume, preferences)

  // 4. Take top 10 matches
  const topJobs = ranked.slice(0, 10)

  // 5. For each top job, generate docs and create application
  const applied: AutoApplyResult["topMatches"] = []

  for (const jobData of topJobs) {
    const jobObj = jobData as Record<string, unknown>
    const jobId = String(jobObj._id)

    // Skip if already applied/saved
    const existing = await Application.findOne({ userId, jobId })
    if (existing) continue

    const job = await Job.findById(jobId)
    if (!job) continue

    let coverLetter = ""
    let tailoredResumeText = ""
    let emailDraft = ""

    // Try to generate application docs
    if (resume) {
      try {
        const userProfile = {
          name: user.name,
          preferences: user.preferences,
          classification: resume.classification,
        }
        const docs = await generateApplicationDocs(resume.rawText, job.description, userProfile)
        coverLetter = docs.coverLetter || ""
        tailoredResumeText = docs.tailoredResumeText || ""
        emailDraft = docs.emailDraft || ""
      } catch (err) {
        console.warn("Doc generation failed for job", job.title, (err as Error).message)
        // Use local fallback cover letter
        const { generateLocalCoverLetter } = await import("./localResumeAnalyzer")
        const local = generateLocalCoverLetter(resume.rawText, job.description, user.name)
        coverLetter = local.coverLetter
        tailoredResumeText = local.tailoredResumeText
        emailDraft = local.emailDraft
      }
    }

    await Application.create({
      userId,
      jobId,
      resumeId: resume?._id || null,
      matchScore: (jobObj.matchScore as number) || 0,
      tailoredResumeText,
      coverLetter,
      emailDraft,
      status: "applied",
      appliedAt: new Date(),
    })

    applied.push({
      jobId,
      title: job.title,
      company: job.company,
      matchScore: (jobObj.matchScore as number) || 0,
      status: "applied",
    })
  }

  return {
    jobsFound: rawJobs.length,
    jobsRanked: ranked.length,
    topMatches: applied,
    appliedCount: applied.length,
  }
}
