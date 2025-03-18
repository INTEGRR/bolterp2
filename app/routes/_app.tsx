import { Outlet, useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import AppLayout from "~/components/AppLayout";
import { createServerClient } from "~/utils/supabase.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response();
  const supabase = createServerClient({ request, response });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return json(
    { session },
    { headers: response.headers }
  );
};

export default function AppRoute() {
  const { session } = useLoaderData<typeof loader>();

  return (
    <AppLayout session={session}>
      <Outlet />
    </AppLayout>
  );
}
