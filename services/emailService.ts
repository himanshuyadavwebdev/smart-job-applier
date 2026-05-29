import nodemailer from "nodemailer"

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

export async function sendApplicationConfirmation(
  user: { email: string; name: string },
  job: { title: string; company: string; location: string; applyUrl: string },
  application: { matchScore: number }
) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email credentials not set. Skipping confirmation email.")
    return
  }

  try {
    const transporter = createTransporter()

    await transporter.sendMail({
      from: `"Smart Job Applier" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Application Submitted: ${job.title} at ${job.company}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1e40af;">Application Confirmed!</h2>
          <p>Hello ${user.name},</p>
          <p>Your application has been submitted for the following position:</p>
          <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <strong>${job.title}</strong><br/>
            ${job.company} &mdash; ${job.location}<br/>
            <span style="color: #64748b; font-size: 14px;">Match Score: ${application.matchScore}%</span>
          </div>
          <p>
            <a href="${job.applyUrl}"
               style="background: #1e40af; color: white; padding: 10px 20px;
                      border-radius: 6px; text-decoration: none; display: inline-block;">
              View Job Posting
            </a>
          </p>
          <p style="color: #64748b; font-size: 13px; margin-top: 24px;">
            Good luck with your application! Track your progress in your dashboard.
          </p>
        </div>
      `,
    })

    console.log(`Confirmation email sent to ${user.email}`)
  } catch (err) {
    console.error("Failed to send confirmation email:", (err as Error).message)
  }
}

export async function sendWelcomeEmail(user: { email: string; name: string }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return

  try {
    const transporter = createTransporter()

    await transporter.sendMail({
      from: `"Smart Job Applier" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Welcome to Smart Job Applier!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1e40af;">Welcome, ${user.name}!</h2>
          <p>Your account has been created successfully.</p>
          <p>Get started by uploading your resume and setting your job preferences.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || ""}/onboarding"
             style="background: #1e40af; color: white; padding: 10px 20px;
                    border-radius: 6px; text-decoration: none; display: inline-block;">
            Get Started
          </a>
        </div>
      `,
    })
  } catch (err) {
    console.error("Failed to send welcome email:", (err as Error).message)
  }
}
