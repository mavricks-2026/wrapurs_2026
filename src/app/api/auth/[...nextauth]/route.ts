import { handlers } from "@/auth";

// Credentials sign-in hashes passwords with node:crypto → Node runtime.
export const runtime = "nodejs";
export const { GET, POST } = handlers;
