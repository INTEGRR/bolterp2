import { useState } from "react";
import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
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
  
  // Allow access if user is authenticated or has a recovery token in URL
  const url = new URL(request.url);
  const hasRecoveryToken = url.searchParams.has("token");
  
  if (!session && !hasRecoveryToken) {
    return redirect("/login");
  }
  
  const translations = await getTranslations(request);
  
  return json({ translations }, { headers: response.headers });
}

export async function action({ request }: ActionFunctionArgs) {
  const response = new Response();
  const supabase = createServerSupabaseClient({ request, response });
  
  const formData = await request.formData();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  
  if (!password || !confirmPassword) {
    return json(
      { error: "Password and confirmation are required" },
      { status: 400, headers: response.headers }
    );
  }
  
  if (password !== confirmPassword) {
    return json(
      { error: "Passwords don't match" },
      { status: 400, headers: response.headers }
    );
  }
  
  const { error } = await supabase.auth.updateUser({
    password,
  });
  
  if (error) {
    return json(
      { error: error.message },
      { status: 400, headers: response.headers }
    );
  }
  
  return redirect("/login", {
    headers: response.headers,
  });
}

export default function UpdatePassword() {
  const { translations } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const t = translations;
  const auth = t.auth || {};
  
  return (
    <Page>
      <div className="max-w-md mx-auto mt-12">
        <Card>
          <div className="p-6">
            <LegacyStack vertical spacing="loose">
              <Text variant="headingLg" as="h1">
                {auth.newPassword || "New Password"}
              </Text>
              
              {actionData?.error && (
                <Banner status="critical">
                  {actionData.error}
                </Banner>
              )}
              
              <Form method="post">
                <FormLayout>
                  <TextField
                    label={auth.newPassword || "New Password"}
                    type="password"
                    name="password"
                    value={password}
                    onChange={setPassword}
                    autoComplete="new-password"
                    required
                  />
                  
                  <TextField
                    label={auth.confirmPassword || "Confirm Password"}
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    autoComplete="new-password"
                    required
                  />
                  
                  <Button primary submit fullWidth>
                    {auth.resetPassword || "Reset Password"}
                  </Button>
                </FormLayout>
              </Form>
              
              <div className="text-center">
                <Link to="/login" className="text-blue-600 hover:underline">
                  {auth.login || "Back to Login"}
                </Link>
              </div>
            </LegacyStack>
          </div>
        </Card>
      </div>
    </Page>
  );
}
