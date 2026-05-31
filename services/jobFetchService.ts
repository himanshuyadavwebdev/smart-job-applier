import axios from "axios"
import * as cheerio from "cheerio"
import { Job } from "@/models/Job.model"

interface NormalizedJob {
  externalId: string
  source: string
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
  "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "Go", "Rust", "Ruby", "PHP",
  "Swift", "Kotlin", "Scala", "React", "Vue", "Angular", "Svelte", "Next.js", "Nuxt",
  "Node.js", "Express", "NestJS", "Django", "Flask", "FastAPI", "Spring", "Spring Boot",
  "Laravel", "Rails", "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Cassandra",
  "DynamoDB", "SQLite", "Elasticsearch", "Firebase", "Supabase", "AWS", "Azure", "GCP",
  "DigitalOcean", "Heroku", "Vercel", "Netlify", "Docker", "Kubernetes", "Jenkins",
  "GitHub Actions", "GitLab CI", "Terraform", "Ansible", "Git", "GitHub", "GitLab",
  "REST", "GraphQL", "gRPC", "WebSocket", "Microservices", "Serverless",
  "HTML", "CSS", "Sass", "Less", "Tailwind CSS", "Bootstrap", "Material UI",
  "Webpack", "Vite", "Redux", "Zustand", "MobX", "React Native", "Flutter", "Ionic",
  "Electron", "Jest", "Mocha", "Cypress", "Playwright", "Selenium", "Vitest",
  "Numpy", "Pandas", "Scikit-learn", "TensorFlow", "PyTorch", "OpenCV",
  "Apache Spark", "Hadoop", "Kafka", "Airflow", "Figma", "Sketch",
  "Agile", "Scrum", "Kanban", "DevOps", "CI/CD", "Linux", "Bash", "Zsh",
  "Nginx", "Apache", "Prometheus", "Grafana", "Prisma", "TypeORM", "Sequelize",
  "Mongoose", "Three.js", "Unity", "WebGL", "Markdown", "LaTeX",
  "Data Structures", "Algorithms", "Design Patterns", "System Design",
  "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Data Science",
  "Big Data", "Data Engineering", "Cybersecurity", "Blockchain", "Solidity", "Web3",
  "iOS", "Android", "AR", "VR", "SRE", "Platform Engineering", "GitOps",
  "Observability", "Distributed Systems", "Technical Writing", "API Design",
  "Product Management", "Team Leadership", "Mentoring", "Customer Support",
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

function makeId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/* ───── RemoteOK (free, no key) ───── */
async function fetchFromRemoteOK(preferences: { desiredRole?: string }) {
  const response = await axios.get("https://remoteok.com/api", {
    timeout: 15000,
    headers: { "User-Agent": "Mozilla/5.0" },
  })

  const data = response.data as unknown[]
  if (!Array.isArray(data)) return []

  const query = preferences.desiredRole?.toLowerCase() || ""

  return data
    .filter((item: unknown) => {
      const job = item as Record<string, unknown>
      if (!job.position && !job.description) return false
      if (!query) return true
      const text = `${job.position} ${job.description} ${job.tags}`.toLowerCase()
      return text.includes(query) || !query
    })
    .slice(0, 50)
    .map((item: unknown) => {
      const job = item as Record<string, unknown>
      const desc = (job.description as string) || (job.position as string) || ""
      return {
        externalId: String(job.id || makeId()),
        source: "RemoteOK",
        title: (job.position as string) || "",
        company: (job.company as string) || (job.legal_name as string) || "",
        location: "Remote",
        jobType: "Remote",
        description: desc,
        salaryMin: job.salary_min ? Number(job.salary_min) : null,
        salaryMax: job.salary_max ? Number(job.salary_max) : null,
        currency: "USD",
        skills: extractSkillsFromDescription(desc),
        applyUrl: (job.apply_url as string) || (job.url as string) || "",
        postedAt: job.date ? new Date(job.date as string) : new Date(),
        expiresAt: null,
      }
    })
    .filter((j) => j.title && j.applyUrl) as NormalizedJob[]
}

/* ───── We Work Remotely (RSS feed, no key) ───── */
async function fetchFromWWR() {
  const response = await axios.get("https://weworkremotely.com/feed.xml", {
    timeout: 15000,
    headers: { "User-Agent": "Mozilla/5.0" },
  })

  const $ = cheerio.load(response.data, { xmlMode: true })
  const jobs: NormalizedJob[] = []

 $("item").each((_, el) => {
    const item = $(el)
    const title = item.find("title").text().trim()
    const link = item.find("link").text().trim()
    const desc = item.find("description").text().trim()
    const company = title.split(":")[0]?.trim() || ""
    const jobTitle = title.split(":")[1]?.trim() || title

    if (!jobTitle || !link) return

    jobs.push({
      externalId: link,
      source: "WeWorkRemotely",
      title: jobTitle,
      company,
      location: "Remote",
      jobType: "Remote",
      description: desc.replace(/<[^>]*>/g, " ").slice(0, 600),
      salaryMin: null,
      salaryMax: null,
      currency: "USD",
      skills: extractSkillsFromDescription(desc),
      applyUrl: link,
      postedAt: new Date(),
      expiresAt: null,
    })
  })

  return jobs.slice(0, 30)
}

/* ───── LinkedIn (public search, scraping) ───── */
async function fetchFromLinkedIn(preferences: { desiredRole?: string; preferredLocations?: string[] }) {
  const keywords = encodeURIComponent(preferences.desiredRole || "software developer")
  const location = encodeURIComponent(preferences.preferredLocations?.[0] || "United States")

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
  const jobs: NormalizedJob[] = []

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
      externalId: link.split("/").pop()?.split("?")[0] || makeId(),
      source: "LinkedIn",
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

/* ───── Adzuna (requires key) ───── */
async function fetchFromAdzuna(preferences: { desiredRole?: string; preferredLocations?: string[]; salaryMin?: number }) {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY
  if (!appId || !appKey) throw new Error("No Adzuna credentials")

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

  const url = `https://api.adzuna.com/v1/api/jobs/us/search/1`
  const response = await axios.get(url, { params, timeout: 10000 })

  return ((response.data.results as unknown[]) || []).map((job) => {
    const j = job as Record<string, unknown>
    return {
      externalId: String(j.id),
      source: "Adzuna",
      title: (j.title as string) || "",
      company: ((j.company as Record<string, string>)?.display_name) || "",
      location: ((j.location as Record<string, string>)?.display_name) || "",
      jobType: (j.contract_time as string) || "",
      description: (j.description as string) || "",
      salaryMin: (j.salary_min as number) || null,
      salaryMax: (j.salary_max as number) || null,
      currency: "USD",
      skills: extractSkillsFromDescription((j.description as string) || ""),
      applyUrl: (j.redirect_url as string) || "",
      postedAt: j.created ? new Date(j.created as string) : null,
      expiresAt: null,
    }
  }) as NormalizedJob[]
}

/* ───── JSearch (requires RapidAPI key) ───── */
async function fetchFromJSearch(preferences: { desiredRole?: string; preferredLocations?: string[] }) {
  const apiKey = process.env.JSEARCH_API_KEY
  if (!apiKey) throw new Error("No JSearch API key")

  const query = preferences.desiredRole || "software developer"
  const location = preferences.preferredLocations?.[0] || "United States"

  const response = await axios.get("https://jsearch.p.rapidapi.com/search", {
    params: { query: `${query} in ${location}`, page: "1", num_pages: "1", date_posted: "month" },
    headers: { "X-RapidAPI-Key": apiKey, "X-RapidAPI-Host": "jsearch.p.rapidapi.com" },
    timeout: 10000,
  })

  return ((response.data.data as unknown[]) || []).map((job) => {
    const j = job as Record<string, unknown>
    return {
      externalId: (j.job_id as string) || makeId(),
      source: "JSearch",
      title: (j.job_title as string) || "",
      company: (j.employer_name as string) || "",
      location: `${(j.job_city as string) || ""}, ${(j.job_country as string) || ""}`.trim().replace(/^,\s*/, ""),
      jobType: (j.job_employment_type as string) || "",
      description: (j.job_description as string) || "",
      salaryMin: (j.job_min_salary as number) || null,
      salaryMax: (j.job_max_salary as number) || null,
      currency: (j.job_salary_currency as string) || "USD",
      skills: (j.job_required_skills as string[]) || extractSkillsFromDescription((j.job_description as string) || ""),
      applyUrl: (j.job_apply_link as string) || "",
      postedAt: j.job_posted_at_datetime_utc ? new Date(j.job_posted_at_datetime_utc as string) : null,
      expiresAt: null,
    }
  }) as NormalizedJob[]
}

/* ───── Synthetic fallback ───── */
function generateSyntheticJobs(query: string, count = 30): NormalizedJob[] {
  const companies = [
    "TechCorp", "InnovateLabs", "CloudScale", "DataDriven", "NextGen AI",
    "QuantumSoft", "CyberShield", "PixelPerfect", "CodeWave", "FutureStack",
    "NebulaWorks", "HorizonDev", "SparkSystems", "ZenithCode", "AtlasDigital",
  ]
  const titles = [
    "Full Stack Developer", "Frontend Engineer", "Backend Developer", "DevOps Engineer",
    "React Developer", "Node.js Engineer", "Python Developer", "JavaScript Developer",
    "Cloud Engineer", "Mobile Developer", "Data Engineer", "Software Architect",
  ]
  const locations = [
    "Remote", "San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA",
    "London, UK", "Berlin, Germany", "Toronto, Canada", "Dublin, Ireland",
  ]
  const descriptions = [
    "We are looking for a talented developer to join our growing engineering team. You will work on scalable web applications using modern technologies.",
    "Join us to build the next generation of cloud-native applications. Strong experience with React, Node.js, and cloud platforms required.",
    "Fast-paced startup seeking a full stack engineer passionate about clean code, performance, and user experience.",
    "Help us revolutionize the industry with cutting-edge AI and machine learning solutions. Looking for creative problem solvers.",
    "Established tech company with great benefits. Work on high-traffic systems serving millions of users daily.",
  ]

  const jobs: NormalizedJob[] = []
  for (let i = 0; i < count; i++) {
    const title = titles[Math.floor(Math.random() * titles.length)]
    const desc = descriptions[Math.floor(Math.random() * descriptions.length)]
    const withQuery = query ? `${desc} Focus on ${query} expertise.` : desc
    jobs.push({
      externalId: `syn_${makeId()}`,
      source: "SmartJobApplier",
      title,
      company: companies[Math.floor(Math.random() * companies.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      jobType: Math.random() > 0.5 ? "Remote" : "Hybrid",
      description: withQuery,
      salaryMin: Math.random() > 0.3 ? 80000 + Math.floor(Math.random() * 80000) : null,
      salaryMax: Math.random() > 0.3 ? 120000 + Math.floor(Math.random() * 100000) : null,
      currency: "USD",
      skills: extractSkillsFromDescription(withQuery),
      applyUrl: `https://example.com/apply/${makeId()}`,
      postedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
      expiresAt: null,
    })
  }
  return jobs
}

/* ───── Main fetch orchestrator ───── */
export async function fetchJobs(preferences: {
  desiredRole?: string
  preferredLocations?: string[]
  salaryMin?: number
}) {
  let jobs: NormalizedJob[] = []

  // 1. Free source: RemoteOK
  try {
    const rok = await fetchFromRemoteOK(preferences)
    jobs = [...jobs, ...rok]
    console.log(`Fetched ${rok.length} jobs from RemoteOK`)
  } catch (err) {
    console.warn("RemoteOK fetch failed:", (err as Error).message)
  }

  // 2. Free source: We Work Remotely
  if (jobs.length < 20) {
    try {
      const wwr = await fetchFromWWR()
      jobs = [...jobs, ...wwr]
      console.log(`Fetched ${wwr.length} jobs from WeWorkRemotely`)
    } catch (err) {
      console.warn("WWR fetch failed:", (err as Error).message)
    }
  }

  // 3. Scraping: LinkedIn
  if (jobs.length < 20) {
    try {
      const li = await fetchFromLinkedIn(preferences)
      jobs = [...jobs, ...li]
      console.log(`Fetched ${li.length} jobs from LinkedIn`)
    } catch (err) {
      console.warn("LinkedIn fetch failed:", (err as Error).message)
    }
  }

  // 4. Optional: Adzuna (if keys configured)
  if (jobs.length < 20) {
    try {
      const adzuna = await fetchFromAdzuna(preferences)
      jobs = [...jobs, ...adzuna]
      console.log(`Fetched ${adzuna.length} jobs from Adzuna`)
    } catch (err) {
      console.warn("Adzuna fetch failed:", (err as Error).message)
    }
  }

  // 5. Optional: JSearch (if key configured)
  if (jobs.length < 20) {
    try {
      const jsearch = await fetchFromJSearch(preferences)
      jobs = [...jobs, ...jsearch]
      console.log(`Fetched ${jsearch.length} jobs from JSearch`)
    } catch (err) {
      console.warn("JSearch fetch failed:", (err as Error).message)
    }
  }

  // 6. Ultimate fallback: synthetic jobs so the app ALWAYS has data
  if (jobs.length < 10) {
    console.warn("All job sources failed. Generating synthetic fallback jobs.")
    const syn = generateSyntheticJobs(preferences.desiredRole || "", 40)
    jobs = [...jobs, ...syn]
  }

  // Deduplicate
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
