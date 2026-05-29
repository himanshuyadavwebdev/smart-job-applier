"use client"

import Link from "next/link"
import {
  IconBriefcase,
  IconLoader2,
  IconMenu,
  IconMoon,
  IconSun,
  IconX,
} from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

export default function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="border-b bg-background/80 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <IconBriefcase className="h-6 w-6 text-primary" />
            <span>Smart Job Applier</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/jobs" className="text-sm font-medium hover:text-primary transition-colors">
              Jobs
            </Link>
            <Link href="/onboarding" className="text-sm font-medium hover:text-primary transition-colors">
              Preferences
            </Link>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-md hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {mounted ? (
                theme === "dark" ? <IconSun className="h-5 w-5" /> : <IconMoon className="h-5 w-5" />
              ) : (
                <IconLoader2 className="h-5 w-5 animate-spin" />
              )}
            </button>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-md hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {mounted ? (
                theme === "dark" ? <IconSun className="h-5 w-5" /> : <IconMoon className="h-5 w-5" />
              ) : (
                <IconLoader2 className="h-5 w-5 animate-spin" />
              )}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <IconX className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t px-4 py-4 space-y-3 bg-background">
          <Link href="/dashboard" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>
            Dashboard
          </Link>
          <Link href="/jobs" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>
            Jobs
          </Link>
          <Link href="/onboarding" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>
            Preferences
          </Link>
        </div>
      )}
    </nav>
  )
}
