import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { createServerClient } from "~/utils/supabase.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const response = new Response();
  const supabase = createServerClient({ request, response });

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "Missing Authorization header" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return json({ error: "Invalid token" }, { status: 401 });
  }

  return json(
    { success: true },
    {
      headers: response.headers,
    }
  );
};
