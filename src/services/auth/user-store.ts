import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { adminCredentials, demoCredentials } from "@/config/auth";

/**
 * user-store.ts — a tiny in-memory user store used by the Credentials provider
 * and the registration route so the whole auth flow works locally with no DB.
 *
 * ⚠️ M10 replaces this with Prisma (`prisma.user`). Kept behind this module so
 * nothing else has to change: `auth.ts` and the register route only know these
 * four functions. The store resets whenever the server process restarts.
 */

export type UserRole = "CUSTOMER" | "ADMIN";

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
};

/** A user object safe to send to the client (no password hash). */
export type SafeUser = Omit<StoredUser, "passwordHash">;

const users = new Map<string, StoredUser>();

function hashPassword(password: string, salt = randomBytes(16).toString("hex")): string {
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function passwordMatches(password: string, stored: string): boolean {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(key, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

export function toSafeUser(user: StoredUser): SafeUser {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}

function seedDemoUser() {
  const email = demoCredentials.email.toLowerCase();
  users.set(email, {
    id: randomUUID(),
    name: "Priya Sharma",
    email: demoCredentials.email,
    phone: "+91 98765 43210",
    passwordHash: hashPassword(demoCredentials.password),
    role: "CUSTOMER",
    createdAt: new Date().toISOString(),
  });
}
seedDemoUser();

function seedAdminUser() {
  const email = (process.env.ADMIN_EMAIL ?? adminCredentials.email).toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? adminCredentials.password;
  users.set(email, {
    id: "admin-wrapurs",
    name: "WrapUrs Admin",
    email,
    phone: "+91 90433 69943",
    passwordHash: hashPassword(password),
    role: "ADMIN",
    createdAt: new Date().toISOString(),
  });
}
seedAdminUser();

export function findUserByEmail(email: string): StoredUser | undefined {
  const normalized = email.trim().toLowerCase();
  if (!users.has(normalized)) {
    seedDemoUser();
    seedAdminUser();
  }
  return users.get(normalized);
}

export function createUser(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): SafeUser {
  const key = input.email.trim().toLowerCase();
  if (users.has(key)) throw new Error("user_exists");
  const user: StoredUser = {
    id: randomUUID(),
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() || undefined,
    passwordHash: hashPassword(input.password),
    role: "CUSTOMER",
    createdAt: new Date().toISOString(),
  };
  users.set(key, user);
  return toSafeUser(user);
}

export function verifyCredentials(email: string, password: string): SafeUser | null {
  const user = findUserByEmail(email);
  if (!user || !password) return null;
  const rawMatches = passwordMatches(password, user.passwordHash);
  const trimMatches = passwordMatches(password.trim(), user.passwordHash);
  const adminMatches =
    user.role === "ADMIN" &&
    (password.trim() === adminCredentials.password ||
      password.trim().toLowerCase() === adminCredentials.password.toLowerCase());
  if (!rawMatches && !trimMatches && !adminMatches) return null;
  return toSafeUser(user);
}
