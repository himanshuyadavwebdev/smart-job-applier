export function validateEnv() {
  const required = [
    "MONGODB_URI",
    "JWT_SECRET",
    "ANTHROPIC_API_KEY",
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(", ")}`)
  }
}
