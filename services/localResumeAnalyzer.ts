const TECH_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "Go", "Rust", "Ruby", "PHP",
  "Swift", "Kotlin", "Scala", "Perl", "R", "MATLAB", "Julia", "Dart", "Elixir", "Clojure",
  "React", "Vue", "Angular", "Svelte", "Next.js", "Nuxt", "Gatsby", "Remix", "Astro",
  "Node.js", "Express", "NestJS", "Fastify", "Koa", "Hapi",
  "Django", "Flask", "FastAPI", "Spring", "Spring Boot", "Laravel", "Rails", "Sinatra",
  "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Cassandra", "DynamoDB", "CouchDB",
  "SQLite", "MariaDB", "Oracle", "MSSQL", "Neo4j", "Elasticsearch", "Firebase", "Supabase",
  "AWS", "Azure", "GCP", "DigitalOcean", "Heroku", "Vercel", "Netlify", "Cloudflare",
  "Docker", "Kubernetes", "Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "Travis CI",
  "Terraform", "Ansible", "Pulumi", "CloudFormation",
  "Git", "GitHub", "GitLab", "Bitbucket",
  "REST", "GraphQL", "gRPC", "WebSocket", "SOAP", "tRPC",
  "Microservices", "Serverless", "Event-Driven", "CQRS", "Event Sourcing",
  "HTML", "CSS", "Sass", "Less", "Tailwind CSS", "Bootstrap", "Material UI", "Chakra UI",
  "Styled Components", "Emotion", "PostCSS",
  "Webpack", "Vite", "Rollup", "Parcel", "esbuild", "Turbopack",
  "Redux", "Zustand", "MobX", "Recoil", "Jotai", "Context API",
  "React Native", "Flutter", "Ionic", "Cordova", "Capacitor", "Expo",
  "Electron", "Tauri",
  "Jest", "Mocha", "Chai", "Cypress", "Playwright", "Selenium", "Puppeteer",
  "Vitest", "Testing Library", "Enzyme", "Karma", "Jasmine",
  "Numpy", "Pandas", "Scikit-learn", "TensorFlow", "PyTorch", "Keras", "OpenCV",
  "Pandas", "Matplotlib", "Seaborn", "Plotly", "D3.js",
  "Apache Spark", "Hadoop", "Kafka", "Airflow", "dbt",
  "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator",
  "Jira", "Confluence", "Trello", "Asana", "Linear", "Notion",
  "Slack", "Discord", "Microsoft Teams",
  "Agile", "Scrum", "Kanban", "Waterfall", "Lean", "DevOps", "CI/CD",
  "OAuth", "JWT", "SSO", "SAML", "LDAP", "RBAC", "2FA", "MFA",
  "Linux", "Unix", "macOS", "Windows", "Bash", "Zsh", "PowerShell",
  "Nginx", "Apache", "HAProxy", "Traefik", "IIS",
  "Prometheus", "Grafana", "Datadog", "New Relic", "Splunk", "ELK Stack",
  "Hibernate", "Prisma", "TypeORM", "Sequelize", "Mongoose", "Drizzle",
  "Socket.io", "Redis Pub/Sub", "RabbitMQ", "ActiveMQ", "ZeroMQ",
  "Three.js", "Babylon.js", "Unity", "Unreal Engine", "WebGL", "OpenGL",
  "Markdown", "LaTeX", "XML", "JSON", "YAML", "TOML",
  "Regex", "Shell Scripting", "Cron", "Systemd",
  "CDN", "DNS", "SSL/TLS", "TCP/IP", "HTTP/2", "HTTP/3", "QUIC", "WebRTC",
  "SEO", "Accessibility", "Web Performance", "Core Web Vitals", "PWA",
  "Data Structures", "Algorithms", "Design Patterns", "System Design", "Architecture",
  "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Data Science",
  "Big Data", "Data Engineering", "Data Warehousing", "ETL", "Data Modeling",
  "Cybersecurity", "Penetration Testing", "Ethical Hacking", "Cryptography",
  "Blockchain", "Smart Contracts", "Solidity", "Web3", "NFT", "DeFi",
  "iOS", "Android", " watchOS", "tvOS", "Wearables",
  "AR", "VR", "MR", "XR", "Spatial Computing",
  "SRE", "Platform Engineering", "Infrastructure as Code", "GitOps",
  "Observability", "Distributed Systems", "High Availability", "Disaster Recovery",
  "Technical Writing", "Documentation", "API Design", "SDK Development",
  "Product Management", "Project Management", "Team Leadership", "Mentoring",
  "Customer Support", "Sales Engineering", "Solutions Architecture",
  "English", "Spanish", "French", "German", "Mandarin", "Japanese", "Hindi",
]

const EXPERIENCE_KEYWORDS: Record<string, string[]> = {
  Junior: [
    "entry level", "entry-level", "junior", "0-1 years", "0-2 years", "1-2 years",
    "intern", "internship", "trainee", "associate", "fresh graduate", "recent graduate",
    "beginner", "novice", "starter",
  ],
  Mid: [
    "mid-level", "mid level", "intermediate", "2-4 years", "2-5 years", "3-5 years",
    "experienced", "professional", "developer", "engineer",
  ],
  Senior: [
    "senior", "sr.", "lead", "principal", "staff", "architect", "5+ years", "6+ years",
    "7+ years", "8+ years", "10+ years", "expert", "specialist", "advanced",
  ],
  Lead: [
    "lead", "manager", "director", "head of", "vp", "cto", "chief", "founder",
    "co-founder", "team lead", "tech lead", "engineering manager", "product owner",
  ],
}

const ROLE_KEYWORDS: Record<string, string[]> = {
  "Full Stack Developer": [
    "full stack", "fullstack", "frontend", "backend", "front-end", "back-end",
    "web developer", "web development", "mern", "mean", "jamstack",
  ],
  "Frontend Developer": [
    "frontend", "front-end", "ui developer", "react", "vue", "angular", "css", "html",
    "web designer", "javascript developer", "typescript developer",
  ],
  "Backend Developer": [
    "backend", "back-end", "api", "server", "database", "node.js", "python developer",
    "java developer", "go developer", "rust developer", "sql", "microservices",
  ],
  "Mobile Developer": [
    "mobile", "ios", "android", "react native", "flutter", "swift", "kotlin",
    "cordova", "ionic", "app developer", "mobile app",
  ],
  "DevOps Engineer": [
    "devops", "sre", "site reliability", "infrastructure", "cloud", "aws", "azure",
    "gcp", "docker", "kubernetes", "ci/cd", "jenkins", "terraform", "ansible",
  ],
  "Data Scientist": [
    "data science", "machine learning", "ml", "ai", "deep learning", "nlp",
    "tensorflow", "pytorch", "pandas", "numpy", "scikit",
  ],
  "Data Engineer": [
    "data engineer", "etl", "data pipeline", "spark", "hadoop", "kafka", "airflow",
    "data warehouse", "big data", "data modeling",
  ],
  "UI/UX Designer": [
    "ui", "ux", "user interface", "user experience", "designer", "figma", "sketch",
    "adobe", "prototyping", "wireframing", "user research",
  ],
  "Product Manager": [
    "product manager", "product owner", "product management", "roadmap", "user stories",
    "agile", "scrum", "stakeholder", "product strategy",
  ],
  "QA Engineer": [
    "qa", "quality assurance", "tester", "testing", "automation", "selenium",
    "cypress", "jest", "cucumber", "regression",
  ],
  "Security Engineer": [
    "security", "cybersecurity", "penetration testing", "ethical hacking", "compliance",
    "vulnerability", "audit", "soc", "incident response",
  ],
  "Cloud Architect": [
    "cloud architect", "solution architect", "enterprise architect", "aws architect",
    "azure architect", "gcp architect", "cloud strategy", "migration",
  ],
}

export function extractSkills(resumeText: string): string[] {
  const found = new Set<string>()
  const lowerText = resumeText.toLowerCase()

  for (const skill of TECH_SKILLS) {
    const regex = new RegExp(
      `\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i"
    )
    if (regex.test(lowerText)) {
      found.add(skill)
    }
  }

  return Array.from(found).sort()
}

export function detectExperienceLevel(resumeText: string): string {
  const lowerText = resumeText.toLowerCase()
  const scores: Record<string, number> = { Junior: 0, Mid: 0, Senior: 0, Lead: 0 }

  for (const [level, keywords] of Object.entries(EXPERIENCE_KEYWORDS)) {
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i")
      if (regex.test(lowerText)) {
        scores[level] += 1
      }
    }
  }

  // Also look for years of experience patterns
  const yearMatches = lowerText.match(/(\d+)\+?\s*years?\s*(of\s*)?experience/i)
  if (yearMatches) {
    const years = parseInt(yearMatches[1])
    if (years >= 8) scores.Lead += 3
    else if (years >= 5) scores.Senior += 3
    else if (years >= 2) scores.Mid += 3
    else scores.Junior += 3
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  return sorted[0][1] > 0 ? sorted[0][0] : "Mid"
}

export function detectRole(resumeText: string): string {
  const lowerText = resumeText.toLowerCase()
  const scores: Record<string, number> = {}

  for (const [role, keywords] of Object.entries(ROLE_KEYWORDS)) {
    scores[role] = 0
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i")
      if (regex.test(lowerText)) {
        scores[role] += 1
      }
    }
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  return sorted[0][1] > 0 ? sorted[0][0] : "Software Developer"
}

export function calculateLocalATSScore(resumeText: string): {
  atsScore: number
  strengths: string[]
  missingSkills: string[]
} {
  const skills = extractSkills(resumeText)
  const text = resumeText.toLowerCase()

  // ATS Score based on multiple factors
  let score = 50 // Base score

  // +10 for having contact info patterns
  if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(resumeText)) score += 5
  if (/\b(linkedin|github|portfolio)\b/i.test(text)) score += 5

  // +10 for quantifiable achievements
  if (/\b\d+%|\b\d+x|\bincreased\b|\bimproved\b|\boptimized\b|\breduced\b/i.test(text)) score += 10

  // +10 for education mention
  if (/\b(bachelor|master|phd|degree|university|college)\b/i.test(text)) score += 10

  // +10 for action verbs
  const actionVerbs = [
    "developed", "built", "created", "designed", "implemented", "deployed",
    "managed", "led", "architected", "optimized", "automated", "integrated",
  ]
  let actionCount = 0
  for (const verb of actionVerbs) {
    if (text.includes(verb)) actionCount++
  }
  score += Math.min(actionCount * 2, 10)

  // +5 for skills diversity
  if (skills.length >= 10) score += 5
  if (skills.length >= 20) score += 5

  // Penalties
  if (text.length < 500) score -= 10 // Too short
  if (/\b(image|scan|pdf not readable)\b/i.test(text)) score -= 20 // Bad parse

  score = Math.max(0, Math.min(100, score))

  const strengths: string[] = []
  if (skills.length >= 10) strengths.push(`Strong technical stack: ${skills.length} skills detected`)
  if (/\b(lead|managed|team|mentor)\b/i.test(text)) strengths.push("Leadership experience")
  if (/\b(international|remote|distributed|global)\b/i.test(text)) strengths.push("Remote/ distributed team experience")
  if (actionCount >= 5) strengths.push("Action-oriented language")
  if (strengths.length === 0) strengths.push("Solid technical foundation")

  // Suggest missing skills based on role
  const role = detectRole(resumeText)
  const commonMissing: Record<string, string[]> = {
    "Full Stack Developer": ["TypeScript", "Docker", "AWS", "GraphQL"],
    "Frontend Developer": ["TypeScript", "Next.js", "Tailwind CSS", "Testing Library"],
    "Backend Developer": ["Docker", "Kubernetes", "Redis", "GraphQL"],
    "Mobile Developer": ["Firebase", "CI/CD", "App Store", "Performance"],
    "DevOps Engineer": ["Terraform", "Prometheus", "Go", "Python"],
    "Data Scientist": ["MLOps", "Docker", "SQL", "Cloud"],
    "Data Engineer": ["Airflow", "dbt", "Snowflake", "Python"],
  }
  const suggested = commonMissing[role] || ["Docker", "CI/CD", "Cloud"]
  const missingSkills = suggested.filter((s) => !skills.includes(s))

  return { atsScore: score, strengths: strengths.slice(0, 5), missingSkills }
}

export function analyzeResumeLocal(resumeText: string) {
  const skills = extractSkills(resumeText)
  const role = detectRole(resumeText)
  const experienceLevel = detectExperienceLevel(resumeText)
  const { atsScore, strengths, missingSkills } = calculateLocalATSScore(resumeText)

  // Detect tech stack from skills
  const techStack = skills.filter((s) =>
    [
      "React", "Vue", "Angular", "Next.js", "Node.js", "Express", "Django",
      "Python", "JavaScript", "TypeScript", "Java", "Go", "Rust", "C#",
      "SQL", "MongoDB", "PostgreSQL", "Redis", "AWS", "Azure", "GCP",
      "Docker", "Kubernetes", "GraphQL", "REST", "Microservices",
    ].includes(s)
  )

  const summary = `${role} with ${experienceLevel.toLowerCase()} level experience. Skilled in ${skills.slice(0, 8).join(", ")}${skills.length > 8 ? ` and ${skills.length - 8} more` : ""}. ATS readiness score: ${atsScore}/100.`

  return {
    role,
    experienceLevel,
    skills,
    techStack,
    strengths,
    missingSkills,
    atsScore,
    summary,
  }
}

export function generateLocalCoverLetter(
  resumeText: string,
  jobDescription: string,
  userName: string
): {
  coverLetter: string
  emailDraft: string
  tailoredResumeText: string
} {
  const resumeSkills = extractSkills(resumeText)
  const jobSkills = extractSkills(jobDescription)
  const matchedSkills = resumeSkills.filter((s) => jobSkills.includes(s))
  const missingJobSkills = jobSkills.filter((s) => !resumeSkills.includes(s)).slice(0, 3)

  const role = detectRole(resumeText)
  const companyMatch = jobDescription.match(/(?:at|with|join)\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s|,|\.|\n|$)/)
  const company = companyMatch ? companyMatch[1].trim() : "your company"

  // Extract job title
  const titleMatch = jobDescription.match(/(?:seeking|hiring|for)\s+(?:a\s+)?([A-Z][A-Za-z0-9\s+#]+?)(?:\s|,|\.|\n|$)/i)
  const jobTitle = titleMatch ? titleMatch[1].trim() : role

  const coverLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${company}. With my background as a ${role.toLowerCase()} and expertise in ${matchedSkills.slice(0, 5).join(", ")}, I am confident I can make a meaningful contribution to your team.

In my previous roles, I have successfully built and maintained scalable applications using ${resumeSkills.slice(0, 6).join(", ")}. I am particularly drawn to this opportunity because ${company} is working on innovative solutions that align with my technical interests and career goals.

${missingJobSkills.length > 0
      ? `While my primary strengths lie in ${matchedSkills.slice(0, 3).join(", ")}, I am also eager to deepen my expertise in ${missingJobSkills.join(", ")} to fully meet the requirements of this role.`
      : `My skill set directly aligns with the requirements outlined in the job description, and I am excited about the prospect of contributing to your engineering culture.`
    }

I would welcome the opportunity to discuss how my experience and skills can benefit ${company}. Thank you for considering my application. I look forward to hearing from you.

Best regards,
${userName || "Applicant"}`

  const emailDraft = `Subject: Application for ${jobTitle} — ${userName || "Applicant"}

Hi Hiring Team at ${company},

I am excited to apply for the ${jobTitle} role. My experience with ${matchedSkills.slice(0, 4).join(", ")} makes me a strong fit for this position.

I have attached my resume and would love the opportunity to discuss how I can contribute to your team.

Best,
${userName || "Applicant"}`

  // Generate a tailored resume summary by emphasizing matched skills
  const tailoredResumeText = resumeText.replace(
    /(skills|technologies|stack)[^.:;]*/i,
    `Skills & Technologies: ${matchedSkills.slice(0, 10).join(", ")}${missingJobSkills.length > 0 ? `, plus foundational knowledge in ${missingJobSkills.join(", ")}` : ""}`
  )

  return { coverLetter, emailDraft, tailoredResumeText }
}
