import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { SessionUser, Role } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "placetrack_enterprise_jwt_secret_default_key";
const COOKIE_NAME = "placetrack_session";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: SessionUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSessionCookie(user: SessionUser): Promise<string> {
  const token = signToken(user);
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return token;
}

export async function removeSessionCookie(): Promise<void> {
  cookies().delete(COOKIE_NAME);
}
