import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { createServerSupabaseClient } from "~/utils/supabase.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const response = new Response();
  const supabase = createServerSupabaseClient({ request, response });
  
  // The token is already being processed by the createServerClient
  // This route just needs to exist to handle the POST request
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return json({ error: "No session found" }, { status: 401, headers: response.headers });
  }
  
  return json({ success: true, session }, { headers: response.headers });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const response = new Response();
  const supabase = createServerSupabaseClient({ request, response });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return json({ error: "No session found" }, { status: 401, headers: response.headers });
  }
  
  return json({ session }, { headers: response.headers });
}
