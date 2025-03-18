import { redirect } from "@remix-run/node";
import type { Session } from "@supabase/supabase-js";
import { createServerClient } from "./supabase.server";

export async function requireAuth(request: Request) {
  const response = new Response();
  const supabase = createServerClient({ request, response });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw redirect("/login", {
      headers: response.headers,
    });
  }

  return { supabase, session, response };
}

export async function getUserByEmail(request: Request, email: string) {
  const response = new Response();
  const supabase = createServerClient({ request, response });

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function createUserProfile(
  request: Request,
  session: Session,
  name: string
) {
  const response = new Response();
  const supabase = createServerClient({ request, response });

  const { data, error } = await supabase.from("profiles").insert([
    {
      id: session.user.id,
      email: session.user.email,
      name,
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error("Error creating user profile:", error);
    return null;
  }

  return data;
}
