import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function callClaude(systemPrompt: string, userPrompt: string, maxTokens = 2000) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  })

  const block = response.content[0]
  if (block.type !== "text") throw new Error("Unexpected Anthropic response block type")
  const text = block.text.trim()
  return text
}

function parseJSON(text: string) {
  let cleaned = text
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) cleaned = fenceMatch[1].trim()
  return JSON.parse(cleaned)
}

export async function classifyResume(rawText: string) {
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
}

export async function getATSScore(rawText: string, jobDescription: string) {
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
}

export async function generateApplicationDocs(
  resumeText: string,
  jobDescription: string,
  userProfile: Record<string, unknown>
) {
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
}
