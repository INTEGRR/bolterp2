import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { createServerSupabaseClient } from "~/utils/supabase.server";

export async function action({ request }: ActionFunctionArgs) {
  const response = new Response();
  const supabase = createServerSupabaseClient({ request, response });
  
  await supabase.auth.signOut();
  
  return redirect("/login", {
    headers: response.headers,
  });
}

export async function loader() {
  return redirect("/login");
}
