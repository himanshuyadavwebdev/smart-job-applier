"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import Navbar from "@/components/navbar"
import {
  IconCheck,
  IconLoader2,
  IconUpload,
} from "@tabler/icons-react"

const JOB_TYPES = ["Remote", "Hybrid", "On-site"]
const EXPERIENCE_LEVELS = ["Junior", "Mid", "Senior", "Lead"]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState({
    desiredRole: "",
    experienceLevel: "" as string,
    salaryMin: "" as string | number,
    jobType: [] as string[],
    preferredLocations: "" as string,
    techStack: "" as string,
  })

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      await api.post("/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setStep(2)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      alert(msg || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleSavePreferences = async () => {
    setSaving(true)
    try {
      await api.put("/resume/preferences", {
        desiredRole: preferences.desiredRole,
        experienceLevel: preferences.experienceLevel,
        salaryMin: Number(preferences.salaryMin) || 0,
        jobType: preferences.jobType,
        preferredLocations: preferences.preferredLocations
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        techStack: preferences.techStack
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      })
      router.push("/dashboard")
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      alert(msg || "Failed to save preferences")
    } finally {
      setSaving(false)
    }
  }

  const toggleJobType = (type: string) => {
    setPreferences((prev) => ({
      ...prev,
      jobType: prev.jobType.includes(type)
        ? prev.jobType.filter((t) => t !== type)
        : [...prev.jobType, type],
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 pt-16 pb-20">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              step >= 1 ? "bg-primary" : "bg-muted"
            }`}
          />
          <div className="h-0.5 w-8 bg-muted" />
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              step >= 2 ? "bg-primary" : "bg-muted"
            }`}
          />
        </div>

        {step === 1 && (
          <div className="rounded-xl border bg-card p-8 shadow-sm">
            <h1 className="text-2xl font-bold mb-2">Upload your resume</h1>
            <p className="text-muted-foreground mb-6">
              We&apos;ll analyze it with AI to detect your skills, experience, and ATS readiness.
            </p>

            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <IconUpload className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">
                {file ? file.name : "Click or drag to upload PDF / DOCX"}
              </p>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="mt-6 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity inline-flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Continue
                  <IconCheck className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="rounded-xl border bg-card p-8 shadow-sm">
            <h1 className="text-2xl font-bold mb-2">Set your preferences</h1>
            <p className="text-muted-foreground mb-6">
              Tell us what you&apos;re looking for so we can find the best matches.
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">Desired Role</label>
                <input
                  type="text"
                  placeholder="e.g. Full Stack Developer"
                  value={preferences.desiredRole}
                  onChange={(e) =>
                    setPreferences((p) => ({ ...p, desiredRole: e.target.value }))
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Experience Level</label>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() =>
                        setPreferences((p) => ({ ...p, experienceLevel: level }))
                      }
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                        preferences.experienceLevel === level
                          ? "bg-primary text-primary-foreground border-primary"
                          : "hover:bg-muted"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Minimum Salary (USD)</label>
                <input
                  type="number"
                  placeholder="e.g. 80000"
                  value={preferences.salaryMin}
                  onChange={(e) =>
                    setPreferences((p) => ({ ...p, salaryMin: e.target.value }))
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Job Type</label>
                <div className="flex flex-wrap gap-2">
                  {JOB_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleJobType(type)}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                        preferences.jobType.includes(type)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "hover:bg-muted"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Preferred Locations (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, Remote"
                  value={preferences.preferredLocations}
                  onChange={(e) =>
                    setPreferences((p) => ({ ...p, preferredLocations: e.target.value }))
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, TypeScript"
                  value={preferences.techStack}
                  onChange={(e) =>
                    setPreferences((p) => ({ ...p, techStack: e.target.value }))
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <button
              onClick={handleSavePreferences}
              disabled={saving}
              className="mt-8 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity inline-flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Finish & Go to Dashboard
                  <IconCheck className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
