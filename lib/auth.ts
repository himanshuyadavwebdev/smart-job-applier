import jwt from "jsonwebtoken"
import { connectDB } from "./db"
import { User } from "@/models/User.model"

export interface AuthContext {
  userId: string
  user: InstanceType<typeof User>
}

// Temporarily bypass auth — returns a demo user for all requests
export async function verifyAuth(_request: Request): Promise<AuthContext> {
  await connectDB()
  let user = await User.findOne({ email: "demo@smartjobapplier.com" })
  if (!user) {
    user = await User.create({
      name: "Demo User",
      email: "demo@smartjobapplier.com",
      passwordHash: "demo",
      preferences: {},
    })
  }
  return { userId: user._id.toString(), user }
}

export function generateToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "7d" })
}
