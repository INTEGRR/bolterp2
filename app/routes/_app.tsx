import { Outlet, useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import AppLayout from "~/components/AppLayout";
import { createServerSupabaseClient } from "~/utils/supabase.server";
import { getCurrentTenant } from "~/utils/tenant.server";
import { getTranslations } from "~/utils/i18n.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { tenant, user, response } = await getCurrentTenant(request);
  const supabase = createServerSupabaseClient({ request, response });
  
  const { data: { session } } = await supabase.auth.getSession();
  const translations = await getTranslations(request);
  
  return json(
    { session, tenant, user, translations },
    { headers: response.headers }
  );
}

export default function AppRoute() {
  const { session, tenant, translations } = useLoaderData<typeof loader>();

  return (
    <AppLayout session={session} tenant={tenant} translations={translations}>
      <Outlet />
    </AppLayout>
  );
}
