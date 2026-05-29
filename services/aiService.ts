import Anthropic from "@anthropic-ai/sdk"
import {
  analyzeResumeLocal,
  generateLocalCoverLetter,
  extractSkills,
  detectRole,
  detectExperienceLevel,
  calculateLocalATSScore,
} from "./localResumeAnalyzer"

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || ""
const hasRealKey = ANTHROPIC_KEY.startsWith("sk-ant") && !ANTHROPIC_KEY.includes("dummy")

let client: Anthropic | null = null
if (hasRealKey) {
  client = new Anthropic({ apiKey: ANTHROPIC_KEY })
}

async function callClaude(systemPrompt: string, userPrompt: string, maxTokens = 2000) {
  if (!client) throw new Error("Anthropic client not initialized")
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  })

  const block = response.content[0]
  if (block.type !== "text") throw new Error("Unexpected Anthropic response block type")
  return block.text.trim()
}

function parseJSON(text: string) {
  let cleaned = text
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) cleaned = fenceMatch[1].trim()
  return JSON.parse(cleaned)
}

/* ───── Resume Classification ───── */

export async function classifyResume(rawText: string) {
  // Always try local first for speed; fallback to Claude if available
  const local = analyzeResumeLocal(rawText)

  if (!hasRealKey) {
    return {
      role: local.role,
      experienceLevel: local.experienceLevel,
      skills: local.skills,
      techStack: local.techStack,
      strengths: local.strengths,
      missingSkills: local.missingSkills,
      atsScore: local.atsScore,
      summary: local.summary,
    }
  }

  try {
    const systemPrompt = `You are an expert technical recruiter and resume analyst.
Analyze the resume text and return ONLY a valid JSON object.
No markdown, no explanation, just JSON.`

    const userPrompt = `Analyze this resume and return JSON with these exact keys:
{
  "role": "string (e.g. Full Stack Developer)",
  "experienceLevel": "Junior | Mid | Senior | Lead",
  "skills": ["string"],
  "techStack": ["string"],
  "strengths": ["string (max 5)"],
  "missingSkills": ["string (common skills for this role they lack)"],
  "atsScore": 0-100,
  "summary": "string (2 sentences max)"
}

Resume:
${rawText}`

    const text = await callClaude(systemPrompt, userPrompt, 2000)
    return parseJSON(text)
  } catch {
    // Graceful fallback to local analysis
    return {
      role: local.role,
      experienceLevel: local.experienceLevel,
      skills: local.skills,
      techStack: local.techStack,
      strengths: local.strengths,
      missingSkills: local.missingSkills,
      atsScore: local.atsScore,
      summary: local.summary,
    }
  }
}

/* ───── ATS Scoring ───── */

export async function getATSScore(rawText: string, jobDescription: string) {
  const localSkills = extractSkills(rawText)
  const jobSkills = extractSkills(jobDescription)
  const matched = localSkills.filter((s) => jobSkills.includes(s))
  const missing = jobSkills.filter((s) => !localSkills.includes(s))

  const keywordMatch = jobSkills.length > 0 ? Math.round((matched.length / jobSkills.length) * 100) : 60
  const role = detectRole(rawText)
  const exp = detectExperienceLevel(rawText)
  const { atsScore } = calculateLocalATSScore(rawText)

  const experienceRelevance = Math.min(100, 50 + matched.length * 5)
  const skillsAlignment = keywordMatch
  const formattingScore = atsScore

  const overall = Math.round(
    keywordMatch * 0.35 +
    experienceRelevance * 0.25 +
    skillsAlignment * 0.25 +
    formattingScore * 0.15
  )

  if (!hasRealKey) {
    return {
      score: overall,
      breakdown: {
        keywordMatch,
        experienceRelevance,
        skillsAlignment,
        formattingScore,
      },
      suggestions: [
        `Add missing keywords: ${missing.slice(0, 5).join(", ") || "review job description"}`,
        "Quantify achievements with numbers and percentages",
        "Use action verbs at the start of bullet points",
        "Match your experience level language to the job posting",
        "Include relevant certifications if applicable",
      ],
      missingKeywords: missing.slice(0, 10),
    }
  }

  try {
    const systemPrompt = `You are an ATS (Applicant Tracking System) expert.
Return ONLY valid JSON. No markdown.`

    const userPrompt = `Score this resume against this job description.
Return JSON:
{
  "score": 0-100,
  "breakdown": {
    "keywordMatch": 0-100,
    "experienceRelevance": 0-100,
    "skillsAlignment": 0-100,
    "formattingScore": 0-100
  },
  "suggestions": ["string (top 5 specific improvements)"],
  "missingKeywords": ["string"]
}

Resume:
${rawText}

Job Description:
${jobDescription}`

    const text = await callClaude(systemPrompt, userPrompt, 3000)
    return parseJSON(text)
  } catch {
    return {
      score: overall,
      breakdown: {
        keywordMatch,
        experienceRelevance,
        skillsAlignment,
        formattingScore,
      },
      suggestions: [
        `Add missing keywords: ${missing.slice(0, 5).join(", ") || "review job description"}`,
        "Quantify achievements with numbers and percentages",
        "Use action verbs at the start of bullet points",
        "Match your experience level language to the job posting",
        "Include relevant certifications if applicable",
      ],
      missingKeywords: missing.slice(0, 10),
    }
  }
}

/* ───── Application Docs ───── */

export async function generateApplicationDocs(
  resumeText: string,
  jobDescription: string,
  userProfile: Record<string, unknown>
) {
  const userName = (userProfile.name as string) || ""

  if (!hasRealKey) {
    const local = generateLocalCoverLetter(resumeText, jobDescription, userName)
    return {
      tailoredResumeText: local.tailoredResumeText,
      coverLetter: local.coverLetter,
      emailDraft: local.emailDraft,
    }
  }

  try {
    const systemPrompt = `You are an expert career coach and professional resume writer.
Return ONLY valid JSON. No markdown, no explanation.`

    const userPrompt = `Generate a job application package. Return JSON:
{
  "tailoredResumeText": "string (full resume text optimized for this job, use keywords from job description, highlight relevant experience, keep it under 600 words)",
  "coverLetter": "string (professional 3-paragraph cover letter, personalized to company and role, under 300 words)",
  "emailDraft": "string (brief professional email to send with application, under 100 words)"
}

User Profile: ${JSON.stringify(userProfile)}

Original Resume:
${resumeText}

Job Description:
${jobDescription}`

    const text = await callClaude(systemPrompt, userPrompt, 4000)
    return parseJSON(text)
  } catch {
    const local = generateLocalCoverLetter(resumeText, jobDescription, userName)
    return {
      tailoredResumeText: local.tailoredResumeText,
      coverLetter: local.coverLetter,
      emailDraft: local.emailDraft,
    }
  }
}
