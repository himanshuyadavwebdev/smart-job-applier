"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import api from "@/lib/api"
import Navbar from "@/components/navbar"
import {
  IconBookmark,
  IconCheck,
  IconExternalLink,
  IconLoader2,
  IconMapPin,
  IconMoneybag,
  IconSearch,
  IconSparkles,
} from "@tabler/icons-react"

interface JobItem {
  _id: string
  title: string
  company: string
  location: string
  jobType: string
  description: string
  salaryMin?: number
  salaryMax?: number
  currency: string
  skills: string[]
  applyUrl: string
  matchScore: number
  isSaved: boolean
  source: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [savingId, setSavingId] = useState<string | null>(null)

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await api.get("/jobs")
      setJobs(res.data.data.jobs || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const toggleSave = async (job: JobItem) => {
    setSavingId(job._id)
    try {
      if (job.isSaved) {
        await api.delete(`/jobs/saved/${job._id}`)
      } else {
        await api.post("/jobs/saved", { jobId: job._id })
      }
      setJobs((prev) =>
        prev.map((j) => (j._id === job._id ? { ...j, isSaved: !j.isSaved } : j))
      )
    } catch {
      // ignore
    } finally {
      setSavingId(null)
    }
  }

  const filtered = jobs.filter((j) => {
    const q = query.toLowerCase()
    return (
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q)
    )
  })

  const formatSalary = (job: JobItem) => {
    if (!job.salaryMin && !job.salaryMax) return "Salary not disclosed"
    const min = job.salaryMin ? `$${job.salaryMin.toLocaleString()}` : ""
    const max = job.salaryMax ? `$${job.salaryMax.toLocaleString()}` : ""
    return [min, max].filter(Boolean).join(" — ") + ` ${job.currency}`
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Matched Jobs</h1>
            <p className="text-muted-foreground mt-1">
              AI-ranked opportunities from LinkedIn, Adzuna & JSearch.
            </p>
          </div>
          <div className="relative max-w-sm w-full">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title, company, or location..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 rounded-xl border bg-card">
            <IconSearch className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No jobs found</h3>
            <p className="text-muted-foreground text-sm mt-2">
              Update your preferences or check back later.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 mt-4 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <IconSparkles className="h-4 w-4" />
              Update Preferences
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {filtered.map((job) => (
              <div
                key={job._id}
                className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold">{job.title}</h3>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                        {job.source}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {job.company}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <IconMapPin className="h-4 w-4" />
                        {job.location || "Remote"}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconMoneybag className="h-4 w-4" />
                        {formatSalary(job)}
                      </span>
                      {job.matchScore > 0 && (
                        <span className="flex items-center gap-1 text-primary font-medium">
                          <IconSparkles className="h-4 w-4" />
                          {job.matchScore}% match
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills.slice(0, 8).map((s) => (
                        <span
                          key={s}
                          className="rounded-full border px-2.5 py-0.5 text-xs font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {job.description}
                    </p>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center gap-2">
                    <button
                      onClick={() => toggleSave(job)}
                      disabled={savingId === job._id}
                      className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        job.isSaved
                          ? "bg-primary text-primary-foreground border-primary"
                          : "hover:bg-muted"
                      }`}
                    >
                      {job.isSaved ? (
                        <IconCheck className="h-4 w-4" />
                      ) : (
                        <IconBookmark className="h-4 w-4" />
                      )}
                      {job.isSaved ? "Saved" : "Save"}
                    </button>
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                      Apply
                      <IconExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
