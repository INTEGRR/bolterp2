import { useState } from "react";
import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import {
  Page,
  Card,
  FormLayout,
  TextField,
  Button,
  Text,
  LegacyStack,
  Banner,
} from "@shopify/polaris";
import { createServerSupabaseClient } from "~/utils/supabase.server";
import { getTranslations } from "~/utils/i18n.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const response = new Response();
  const supabase = createServerSupabaseClient({ request, response });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    return redirect("/");
  }
  
  const translations = await getTranslations(request);
  
  return json({ translations }, { headers: response.headers });
}

export async function action({ request }: ActionFunctionArgs) {
  const response = new Response();
  const supabase = createServerSupabaseClient({ request, response });
  
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  if (!email || !password) {
    return json(
      { error: "Email and password are required" },
      { status: 400, headers: response.headers }
    );
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error("Login error:", error.message);
    return json(
      { error: error.message },
      { status: 400, headers: response.headers }
    );
  }
  
  if (!data.session) {
    return json(
      { error: "Failed to create session" },
      { status: 400, headers: response.headers }
    );
  }
  
  // Set the session cookie
  return redirect("/", {
    headers: {
      ...response.headers,
      "Set-Cookie": `supabase-auth-token=${data.session.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`,
    }
  });
}

export default function Login() {
  const { translations } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const t = translations;
  const auth = t.auth || {};
  
  return (
    <Page>
      <div className="max-w-md mx-auto mt-12">
        <Card>
          <div className="p-6">
            <LegacyStack vertical spacing="loose">
              <Text variant="headingLg" as="h1">
                {auth.login || "Login"}
              </Text>
              
              {actionData?.error && (
                <Banner status="critical">
                  {actionData.error}
                </Banner>
              )}
              
              <Form method="post">
                <FormLayout>
                  <TextField
                    label={auth.email || "Email"}
                    type="email"
                    name="email"
                    value={email}
                    onChange={setEmail}
                    autoComplete="email"
                    required
                  />
                  
                  <TextField
                    label={auth.password || "Password"}
                    type="password"
                    name="password"
                    value={password}
                    onChange={setPassword}
                    autoComplete="current-password"
                    required
                  />
                  
                  <Button 
                    primary 
                    submit 
                    fullWidth
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Logging in..." : (auth.login || "Login")}
                  </Button>
                </FormLayout>
              </Form>
              
              <LegacyStack distribution="equalSpacing">
                <Link to="/reset-password" className="text-blue-600 hover:underline">
                  {auth.forgotPassword || "Forgot Password?"}
                </Link>
                <Link to="/signup" className="text-blue-600 hover:underline">
                  {auth.dontHaveAccount || "Don't have an account?"}
                </Link>
              </LegacyStack>
            </LegacyStack>
          </div>
        </Card>
      </div>
    </Page>
  );
}
