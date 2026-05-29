import Link from "next/link"
import Navbar from "@/components/navbar"
import {
  IconBrain,
  IconBriefcase,
  IconFileText,
  IconRocket,
  IconSearch,
  IconShieldCheck,
  IconSparkles,
} from "@tabler/icons-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium mb-6">
            <IconSparkles className="h-4 w-4 text-primary" />
            <span>Now with LinkedIn, Adzuna & JSearch aggregation</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Land your dream job with{" "}
            <span className="text-primary">AI-powered precision</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Upload your resume, get an ATS score, discover matched roles from LinkedIn and top job boards, and generate tailored cover letters — all in one place.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 transition-opacity"
            >
              <IconRocket className="h-4 w-4" />
              Get Started
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-lg border px-8 py-3 text-sm font-semibold hover:bg-muted transition-colors"
            >
              <IconSearch className="h-4 w-4" />
              Explore Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to apply smarter
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: IconFileText,
                title: "Resume Analysis",
                desc: "Extract skills, experience level, and get an instant ATS-readiness score powered by Claude AI.",
              },
              {
                icon: IconSearch,
                title: "Multi-Source Jobs",
                desc: "Aggregates fresh roles from LinkedIn, Adzuna, and JSearch so you never miss an opportunity.",
              },
              {
                icon: IconBrain,
                title: "Smart Matching",
                desc: "AI ranks jobs by skill overlap, salary fit, experience alignment, and location preferences.",
              },
              {
                icon: IconSparkles,
                title: "Tailored Applications",
                desc: "Auto-generate optimized resumes, cover letters, and outreach emails for every job.",
              },
              {
                icon: IconShieldCheck,
                title: "Track & Manage",
                desc: "Save jobs, track application status, and receive confirmation emails in one dashboard.",
              },
              {
                icon: IconBriefcase,
                title: "One-Click Apply",
                desc: "Preview generated documents, edit if needed, and confirm applications in seconds.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to stop scrolling and start applying?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join thousands of job seekers who use Smart Job Applier to land interviews faster.
          </p>
          <div className="mt-8">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 transition-opacity"
            >
              Start Now
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t py-10 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Smart Job Applier. Built with Next.js, Tailwind v4 & shadcn/ui.</p>
      </footer>
    </div>
  )
}
