import jwt from "jsonwebtoken"
import { connectDB } from "./db"
import { User } from "@/models/User.model"

export interface AuthContext {
  userId: string
  user: InstanceType<typeof User>
}

export async function verifyAuth(request: Request): Promise<AuthContext> {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized")
  }

  const token = authHeader.split(" ")[1]
  const secret = process.env.JWT_SECRET!

  try {
    const decoded = jwt.verify(token, secret) as { userId: string }
    await connectDB()
    const user = await User.findById(decoded.userId)
    if (!user) {
      throw new Error("User not found")
    }
    return { userId: decoded.userId, user }
  } catch {
    throw new Error("Invalid token")
  }
}

export function generateToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "7d" })
}
