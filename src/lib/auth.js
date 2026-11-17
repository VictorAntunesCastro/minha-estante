import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const COOKIE_NAME = "estante_session";
const SECRET = process.env.AUTH_SECRET || "minha-estante-secret-key-2026";

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, originalHash] = stored.split(":");
  const hashBuffer = crypto.scryptSync(password, salt, 64);
  const originalBuffer = Buffer.from(originalHash, "hex");
  if (hashBuffer.length !== originalBuffer.length) return false;
  return crypto.timingSafeEqual(hashBuffer, originalBuffer);
}

export function createSessionToken(userId) {
  const payload = `${userId}.${Date.now()}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userIdStr, timestamp, sig] = parts;
  const payload = `${userIdStr}.${timestamp}`;
  const expectedSig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  if (sig !== expectedSig) return null;
  const userId = Number(userIdStr);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const userId = verifySessionToken(token);
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, name: true, annualGoal: true },
    });
    return user || null;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
