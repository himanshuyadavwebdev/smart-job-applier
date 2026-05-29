function calculateSkillOverlap(jobSkills: string[], userSkills: string[]) {
  if (!jobSkills || jobSkills.length === 0) return 50
  if (!userSkills || userSkills.length === 0) return 0

  const jobSet = new Set(jobSkills.map((s) => s.toLowerCase()))
  const userSet = new Set(userSkills.map((s) => s.toLowerCase()))

  let matched = 0
  for (const skill of jobSet) {
    if (userSet.has(skill)) matched++
  }

  return Math.round((matched / jobSet.size) * 100)
}

function calculateSalaryFit(
  job: { salaryMin?: number | null; salaryMax?: number | null },
  preferences: { salaryMin?: number }
) {
  if (!preferences?.salaryMin || preferences.salaryMin === 0) return 75
  if (!job.salaryMin && !job.salaryMax) return 60

  const jobMax = job.salaryMax || job.salaryMin
  const userMin = preferences.salaryMin

  if (!jobMax || !userMin) return 60
  if (jobMax >= userMin) return 100

  const gap = (userMin - jobMax) / userMin
  if (gap <= 0.1) return 80
  if (gap <= 0.25) return 50
  return 20
}

function calculateExperienceMatch(
  job: { title?: string; description?: string },
  resume?: { classification?: { experienceLevel?: string } }
) {
  if (!resume?.classification?.experienceLevel) return 60

  const levelMap: Record<string, number> = { Junior: 1, Mid: 2, Senior: 3, Lead: 4 }
  const userLevel = levelMap[resume.classification.experienceLevel] || 2

  const titleLower = (job.title || "").toLowerCase()
  const descLower = (job.description || "").toLowerCase()

  let jobLevel = 2
  if (
    titleLower.includes("junior") ||
    titleLower.includes("entry") ||
    descLower.includes("0-2 years")
  ) {
    jobLevel = 1
  } else if (
    titleLower.includes("senior") ||
    descLower.includes("5+ years") ||
    descLower.includes("senior")
  ) {
    jobLevel = 3
  } else if (
    titleLower.includes("lead") ||
    titleLower.includes("principal") ||
    titleLower.includes("staff")
  ) {
    jobLevel = 4
  }

  const diff = Math.abs(userLevel - jobLevel)
  if (diff === 0) return 100
  if (diff === 1) return 70
  if (diff === 2) return 40
  return 10
}

function calculateLocationMatch(
  job: { location?: string; jobType?: string; description?: string },
  preferences: {
    jobType?: string[]
    preferredLocations?: string[]
  }
) {
  if (!preferences?.jobType || preferences.jobType.length === 0) return 70

  const jobLocLower = (job.location || "").toLowerCase()
  const jobTypeLower = (job.jobType || "").toLowerCase()

  const isRemote =
    jobLocLower.includes("remote") ||
    jobTypeLower.includes("remote") ||
    (job.description || "").toLowerCase().includes("fully remote")

  if (preferences.jobType.includes("Remote") && isRemote) return 100

  const prefLocations = (preferences.preferredLocations || []).map((l) => l.toLowerCase())
  for (const loc of prefLocations) {
    if (jobLocLower.includes(loc)) return 90
  }

  if (preferences.jobType.includes("Hybrid") && jobTypeLower.includes("hybrid")) return 80
  if (preferences.jobType.includes("On-site") && !isRemote) return 70

  return 40
}

export function rankJobs(
  jobs: Array<Record<string, unknown> & { toObject?: () => Record<string, unknown> }>,
  resume?: { classification?: { skills?: string[]; experienceLevel?: string } } | null,
  preferences?: {
    salaryMin?: number
    jobType?: string[]
    preferredLocations?: string[]
  } | null
) {
  const ranked = jobs.map((job) => {
    const jobObj = job.toObject ? job.toObject() : { ...job }

    const skillScore = calculateSkillOverlap(
      (jobObj.skills as string[]) || [],
      resume?.classification?.skills || []
    )
    const salaryScore = calculateSalaryFit(
      jobObj as { salaryMin?: number | null; salaryMax?: number | null },
      preferences || {}
    )
    const experienceScore = calculateExperienceMatch(
      jobObj as { title?: string; description?: string },
      resume || undefined
    )
    const locationScore = calculateLocationMatch(
      jobObj as { location?: string; jobType?: string; description?: string },
      preferences || {}
    )

    const matchScore = Math.round(
      skillScore * 0.45 + salaryScore * 0.2 + experienceScore * 0.25 + locationScore * 0.1
    )

    return { ...(jobObj as object), matchScore }
  })

  return ranked.sort((a, b) => (b.matchScore as number) - (a.matchScore as number)).slice(0, 100)
}
