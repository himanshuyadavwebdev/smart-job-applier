"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import api from "@/lib/api"
import Navbar from "@/components/navbar"
import { useAuthStore } from "@/stores/authStore"
import {
  IconBriefcase,
  IconFileCheck,
  IconLoader2,
  IconMail,
  IconPlus,
  IconSparkles,
  IconUpload,
} from "@tabler/icons-react"

interface ResumeData {
  classification?: {
    role?: string
    atsScore?: number
    skills?: string[]
    summary?: string
  }
}

interface Application {
  _id: string
  status: string
  createdAt: string
  jobId?: {
    title: string
    company: string
  }
}

export default function DashboardPage() {
  const { user, token, hydrate } = useAuthStore()
  const [resume, setResume] = useState<ResumeData | null>(null)
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (!token) return
    const fetchData = async () => {
      try {
        const [rRes, aRes] = await Promise.all([
          api.get("/resume").catch(() => null),
          api.get("/apply/history").catch(() => null),
        ])
        if (rRes?.data?.success) setResume(rRes.data.data)
        if (aRes?.data?.success) setApps(aRes.data.data.slice(0, 5))
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token])

  const atsScore = resume?.classification?.atsScore || 0
  const role = resume?.classification?.role || "—"
  const skills = resume?.classification?.skills || []

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          Welcome back, {user?.name || "Job Seeker"}. Here is your activity at a glance.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
              <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <IconFileCheck className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">ATS Score</span>
                </div>
                <div className="text-3xl font-bold">{atsScore > 0 ? `${atsScore}/100` : "—"}</div>
              </div>
              <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <IconBriefcase className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Total Applications</span>
                </div>
                <div className="text-3xl font-bold">{apps.length}</div>
              </div>
              <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <IconMail className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Saved Jobs</span>
                </div>
                <div className="text-3xl font-bold">
                  {apps.filter((a) => a.status === "saved").length}
                </div>
              </div>
              <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <IconSparkles className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Top Role Match</span>
                </div>
                <div className="text-xl font-bold truncate">{role}</div>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Resume Card */}
              <div className="lg:col-span-2 rounded-xl border bg-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Your Resume</h2>
                  <Link
                    href="/onboarding"
                    className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <IconUpload className="h-4 w-4" />
                    Update
                  </Link>
                </div>
                {resume ? (
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Detected Role</span>
                      <p className="font-medium">{role}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Skills Detected</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {skills.slice(0, 12).map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    {resume.classification?.summary && (
                      <div>
                        <span className="text-sm text-muted-foreground">Summary</span>
                        <p className="text-sm leading-relaxed mt-1">{resume.classification.summary}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground mb-4">
                      You haven&apos;t uploaded a resume yet.
                    </p>
                    <Link
                      href="/onboarding"
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                      <IconPlus className="h-4 w-4" />
                      Upload Resume
                    </Link>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="rounded-xl border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                {apps.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No applications yet.{" "}
                    <Link href="/jobs" className="text-primary hover:underline">
                      Browse jobs
                    </Link>
                  </p>
                ) : (
                  <div className="space-y-4">
                    {apps.map((app) => (
                      <div key={app._id} className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {app.jobId?.title || "Unknown Job"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {app.jobId?.company || ""}
                          </p>
                        </div>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium capitalize">
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
