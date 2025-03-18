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
  
  if (!email) {
    return json(
      { error: "Email is required" },
      { status: 400, headers: response.headers }
    );
  }
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${new URL(request.url).origin}/update-password`,
  });
  
  if (error) {
    return json(
      { error: error.message },
      { status: 400, headers: response.headers }
    );
  }
  
  return json(
    { success: true },
    { headers: response.headers }
  );
}

export default function ResetPassword() {
  const { translations } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [email, setEmail] = useState("");
  
  const t = translations;
  const auth = t.auth || {};
  
  return (
    <Page>
      <div className="max-w-md mx-auto mt-12">
        <Card>
          <div className="p-6">
            <LegacyStack vertical spacing="loose">
              <Text variant="headingLg" as="h1">
                {auth.resetPassword || "Reset Password"}
              </Text>
              
              {actionData?.error && (
                <Banner status="critical">
                  {actionData.error}
                </Banner>
              )}
              
              {actionData?.success ? (
                <Banner status="success">
                  {auth.passwordResetSent || "A password reset email has been sent"}
                </Banner>
              ) : (
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
                    
                    <Button primary submit fullWidth>
                      {auth.resetPassword || "Reset Password"}
                    </Button>
                  </FormLayout>
                </Form>
              )}
              
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
