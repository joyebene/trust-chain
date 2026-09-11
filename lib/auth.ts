import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "development-secret-change-me");

export type Session = { id: string; role: "user" | "admin"; email: string; name: string };

export async function createSession(user: Session) {
  const token = await new SignJWT(user).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret);
  const store = await cookies();
  store.set("tc_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/" });
}

export async function getSession(): Promise<Session | null> {
  try {
    const token = (await cookies()).get("tc_session")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret);
    return { id: String(payload.id), role: payload.role as Session["role"], email: String(payload.email), name: String(payload.name) };
  } catch { return null; }
}

export async function requireSession(role?: "user"|"admin") {
  const session = await getSession();
  if (!session || (role && session.role !== role)) throw new Error("UNAUTHORIZED");
  return session;
}

export async function clearSession() {
  (await cookies()).set("tc_session", "", { httpOnly: true, expires: new Date(0), path: "/" });
}
