import { createServerClient as createClient } from "@supabase/auth-helpers-remix";
import { createCookieSessionStorage } from "@remix-run/node";

if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL is required");
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error("SUPABASE_ANON_KEY is required");
}

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is required");
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "sb-session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export const createServerClient = ({
  request,
  response,
}: {
  request: Request;
  response: Response;
}) =>
  createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );
