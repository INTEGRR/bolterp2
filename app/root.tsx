import { useEffect, useState } from "react";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRevalidator,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { createBrowserClient } from "@supabase/auth-helpers-remix";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";

import "./tailwind.css";
import { createServerSupabaseClient } from "./utils/supabase.server";

export const links: LinksFunction = () => [];

export async function loader({ request }: LoaderFunctionArgs) {
  const response = new Response();
  const supabase = createServerSupabaseClient({ request, response });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  return json({ env, session }, { headers: response.headers });
}

export default function App() {
  const { env, session } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const [supabase] = useState(() =>
    createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  );

  const serverAccessToken = session?.access_token;

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || 
          (event !== "INITIAL_SESSION" && session?.access_token !== serverAccessToken)) {
        // Refresh data
        revalidator.revalidate();
        
        // Call our API route to handle server-side session
        if (event === "SIGNED_IN" && session) {
          fetch("/api/auth/session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.access_token}`
            },
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, serverAccessToken, revalidator]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <AppProvider>
          <Outlet context={{ supabase }} />
        </AppProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
