import axios from "axios"
import * as cheerio from "cheerio"
import { Job } from "@/models/Job.model"

interface NormalizedJob {
  externalId: string
  source: "Adzuna" | "JSearch" | "LinkedIn"
  title: string
  company: string
  location: string
  jobType: string
  description: string
  salaryMin: number | null
  salaryMax: number | null
  currency: string
  skills: string[]
  applyUrl: string
  postedAt: Date | null
  expiresAt: null
}

const TECH_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "Go", "Rust",
  "React", "Vue", "Angular", "Node.js", "Express", "Django", "Spring",
  "SQL", "MongoDB", "PostgreSQL", "MySQL", "Redis", "AWS", "Azure", "GCP",
  "Docker", "Kubernetes", "CI/CD", "Git", "REST", "GraphQL", "Microservices",
  "HTML", "CSS", "Tailwind", "Next.js", "Nuxt", "Flutter", "React Native",
]

function extractSkillsFromDescription(description: string) {
  const found: string[] = []
  const lower = description.toLowerCase()
  for (const skill of TECH_SKILLS) {
    if (lower.includes(skill.toLowerCase())) {
      found.push(skill)
    }
  }
  return found.slice(0, 15)
}

function normalizeAdzunaJob(job: Record<string, unknown>): NormalizedJob {
  return {
    externalId: String(job.id),
    source: "Adzuna",
    title: (job.title as string) || "",
    company: ((job.company as Record<string, string>)?.display_name) || "",
    location: ((job.location as Record<string, string>)?.display_name) || "",
    jobType: (job.contract_time as string) || "",
    description: (job.description as string) || "",
    salaryMin: (job.salary_min as number) || null,
    salaryMax: (job.salary_max as number) || null,
    currency: "USD",
    skills: extractSkillsFromDescription((job.description as string) || ""),
    applyUrl: (job.redirect_url as string) || (job.adref as string) || "",
    postedAt: job.created ? new Date(job.created as string) : null,
    expiresAt: null,
  }
}

function normalizeJSearchJob(job: Record<string, unknown>): NormalizedJob {
  return {
    externalId: (job.job_id as string) || String(Date.now()),
    source: "JSearch",
    title: (job.job_title as string) || "",
    company: (job.employer_name as string) || "",
    location: `${(job.job_city as string) || ""}, ${(job.job_country as string) || ""}`
      .trim()
      .replace(/^,\s*/, ""),
    jobType: (job.job_employment_type as string) || "",
    description: (job.job_description as string) || "",
    salaryMin: (job.job_min_salary as number) || null,
    salaryMax: (job.job_max_salary as number) || null,
    currency: (job.job_salary_currency as string) || "USD",
    skills:
      (job.job_required_skills as string[]) ||
      extractSkillsFromDescription((job.job_description as string) || ""),
    applyUrl: (job.job_apply_link as string) || "",
    postedAt: job.job_posted_at_datetime_utc
      ? new Date(job.job_posted_at_datetime_utc as string)
      : null,
    expiresAt: null,
  }
}

async function fetchFromAdzuna(preferences: {
  desiredRole?: string
  preferredLocations?: string[]
  salaryMin?: number
}) {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY

  if (!appId || !appKey) {
    throw new Error("Adzuna API credentials not configured.")
  }

  const params: Record<string, string | number> = {
    app_id: appId,
    app_key: appKey,
    results_per_page: 50,
    what: preferences.desiredRole || "software developer",
    content_type: "application/json",
  }

  if (preferences.preferredLocations?.length && preferences.preferredLocations[0]) {
    params.where = preferences.preferredLocations[0]
  }
  if (preferences.salaryMin && preferences.salaryMin > 0) {
    params.salary_min = preferences.salaryMin
  }

  const country = "us"
  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1`

  const response = await axios.get(url, { params, timeout: 10000 })
  return ((response.data.results as Record<string, unknown>[]) || []).map(normalizeAdzunaJob)
}

async function fetchFromJSearch(preferences: {
  desiredRole?: string
  preferredLocations?: string[]
}) {
  const apiKey = process.env.JSEARCH_API_KEY
  if (!apiKey) {
    throw new Error("JSearch API key not configured.")
  }

  const query = preferences.desiredRole || "software developer"
  const location = preferences.preferredLocations?.[0] || "United States"

  const response = await axios.get("https://jsearch.p.rapidapi.com/search", {
    params: {
      query: `${query} in ${location}`,
      page: "1",
      num_pages: "1",
      date_posted: "month",
    },
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    },
    timeout: 10000,
  })

  return ((response.data.data as Record<string, unknown>[]) || []).map(normalizeJSearchJob)
}

async function fetchFromLinkedIn(preferences: {
  desiredRole?: string
  preferredLocations?: string[]
}) {
  const keywords = encodeURIComponent(preferences.desiredRole || "software developer")
  const location = encodeURIComponent(preferences.preferredLocations?.[0] || "United States")

  // LinkedIn public job search guest endpoint
  const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${keywords}&location=${location}&start=0`

  const response = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      Accept: "text/html",
      "Accept-Language": "en-US,en;q=0.9",
    },
    timeout: 15000,
  })

  const $ = cheerio.load(response.data)
  const jobs: ReturnType<typeof normalizeAdzunaJob>[] = []

  $("li").each((_, el) => {
    const card = $(el)
    const title = card.find(".base-search-card__title").text().trim()
    const company = card.find(".base-search-card__subtitle").text().trim()
    const loc = card.find(".job-search-card__location").text().trim()
    const link = card.find("a.base-card__full-link").attr("href") || ""
    const dateStr = card.find("time").attr("datetime")
    const description = card.find(".base-search-card__metadata").text().trim()

    if (!title || !company) return

    jobs.push({
      externalId: link.split("/").pop()?.split("?")[0] || String(Date.now() + Math.random()),
      source: "LinkedIn" as const,
      title,
      company,
      location: loc,
      jobType: "",
      description: description || `${title} at ${company}`,
      salaryMin: null,
      salaryMax: null,
      currency: "USD",
      skills: extractSkillsFromDescription(description || ""),
      applyUrl: link,
      postedAt: dateStr ? new Date(dateStr) : new Date(),
      expiresAt: null,
    })
  })

  return jobs
}

export async function fetchJobs(preferences: {
  desiredRole?: string
  preferredLocations?: string[]
  salaryMin?: number
}) {
  let jobs: NormalizedJob[] = []

  try {
    const adzunaJobs = await fetchFromAdzuna(preferences)
    jobs = [...jobs, ...adzunaJobs]
    console.log(`Fetched ${adzunaJobs.length} jobs from Adzuna`)
  } catch (err) {
    console.warn("Adzuna fetch failed:", (err as Error).message)
  }

  if (jobs.length < 20) {
    try {
      const jsearchJobs = await fetchFromJSearch(preferences)
      jobs = [...jobs, ...jsearchJobs]
      console.log(`Fetched ${jsearchJobs.length} jobs from JSearch`)
    } catch (err) {
      console.warn("JSearch fetch failed:", (err as Error).message)
    }
  }

  if (jobs.length < 20) {
    try {
      const linkedinJobs = await fetchFromLinkedIn(preferences)
      jobs = [...jobs, ...linkedinJobs]
      console.log(`Fetched ${linkedinJobs.length} jobs from LinkedIn`)
    } catch (err) {
      console.warn("LinkedIn fetch failed:", (err as Error).message)
    }
  }

  // Deduplicate by title + company
  const seen = new Set<string>()
  const unique = jobs.filter((job) => {
    const key = `${job.title?.toLowerCase()}-${job.company?.toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const limited = unique.slice(0, 100)

  // Upsert into DB
  const upserted = await Promise.all(
    limited.map((job) =>
      Job.findOneAndUpdate(
        { externalId: job.externalId, source: job.source },
        { $set: { ...job, fetchedAt: new Date() } },
        { upsert: true, new: true }
      )
    )
  )

  return upserted.filter(Boolean)
}
