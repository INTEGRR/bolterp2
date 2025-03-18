import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { createServerClient } from "~/utils/supabase.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const response = new Response();
  const supabase = createServerClient({ request, response });

  await supabase.auth.signOut();

  return redirect("/login", {
    headers: response.headers,
  });
};

export const loader = async () => {
  return redirect("/");
};
