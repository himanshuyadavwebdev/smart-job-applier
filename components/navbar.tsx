"use client"

import Link from "next/link"
import { useAuthStore } from "@/stores/authStore"
import {
  IconBriefcase,
  IconChartBar,
  IconLogout,
  IconMenu,
  IconMoon,
  IconSun,
  IconUser,
  IconX,
} from "@tabler/icons-react"
import { useState } from "react"
import { useTheme } from "next-themes"

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="border-b bg-background/80 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <IconBriefcase className="h-6 w-6 text-primary" />
            <span>Smart Job Applier</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link href="/jobs" className="text-sm font-medium hover:text-primary transition-colors">
                  Jobs
                </Link>
                <Link href="/onboarding" className="text-sm font-medium hover:text-primary transition-colors">
                  Preferences
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
              </>
            )}

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-md hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <IconSun className="h-5 w-5" /> : <IconMoon className="h-5 w-5" />}
            </button>

            {user && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <IconUser className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                  title="Logout"
                >
                  <IconLogout className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-md hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <IconSun className="h-5 w-5" /> : <IconMoon className="h-5 w-5" />}
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
          {user ? (
            <>
              <Link href="/dashboard" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>
                Dashboard
              </Link>
              <Link href="/jobs" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>
                Jobs
              </Link>
              <Link href="/onboarding" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>
                Preferences
              </Link>
              <button onClick={() => { logout(); setMobileOpen(false) }} className="flex items-center gap-2 text-sm font-medium text-destructive">
                <IconLogout className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>
                Log in
              </Link>
              <Link href="/register" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
