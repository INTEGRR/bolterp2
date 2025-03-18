import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation, Link } from "@remix-run/react";
import {
  Page,
  Card,
  FormLayout,
  TextField,
  Button,
  Text,
  Banner,
  LegacyStack,
} from "@shopify/polaris";
import { createServerClient } from "~/utils/supabase.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response();
  const supabase = createServerClient({ request, response });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    return redirect("/", {
      headers: response.headers,
    });
  }

  return json({}, { headers: response.headers });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const response = new Response();
  const supabase = createServerClient({ request, response });

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
    { success: true, message: "Check your email for the password reset link" },
    { headers: response.headers }
  );
};

export default function ResetPassword() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [email, setEmail] = useState("");

  return (
    <Page>
      <div className="max-w-md mx-auto mt-12">
        <Card>
          <div className="p-6">
            <LegacyStack vertical spacing="loose">
              <Text variant="headingLg" as="h1">
                Reset your password
              </Text>

              {actionData?.error && (
                <Banner status="critical">{actionData.error}</Banner>
              )}

              {actionData?.success && (
                <Banner status="success">{actionData.message}</Banner>
              )}

              {!actionData?.success && (
                <Form method="post">
                  <FormLayout>
                    <TextField
                      label="Email"
                      type="email"
                      name="email"
                      value={email}
                      onChange={setEmail}
                      autoComplete="email"
                      required
                    />
                    <Button
                      submit
                      primary
                      fullWidth
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      Send reset link
                    </Button>
                  </FormLayout>
                </Form>
              )}

              <div className="flex justify-center mt-4">
                <Link to="/login" className="text-blue-600 hover:underline">
                  Back to login
                </Link>
              </div>
            </LegacyStack>
          </div>
        </Card>
      </div>
    </Page>
  );
}
