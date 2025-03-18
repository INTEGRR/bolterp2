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

  // If no session and no hash in URL, redirect to login
  const url = new URL(request.url);
  if (!session && !url.hash) {
    return redirect("/login", {
      headers: response.headers,
    });
  }

  return json({}, { headers: response.headers });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const response = new Response();
  const supabase = createServerClient({ request, response });

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
      { error: "Passwords do not match" },
      { status: 400, headers: response.headers }
    );
  }

  if (password.length < 6) {
    return json(
      { error: "Password must be at least 6 characters" },
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

  return json(
    { success: true, message: "Password updated successfully" },
    { headers: response.headers }
  );
};

export default function UpdatePassword() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <Page>
      <div className="max-w-md mx-auto mt-12">
        <Card>
          <div className="p-6">
            <LegacyStack vertical spacing="loose">
              <Text variant="headingLg" as="h1">
                Update your password
              </Text>

              {actionData?.error && (
                <Banner status="critical">{actionData.error}</Banner>
              )}

              {actionData?.success && (
                <Banner status="success">
                  {actionData.message}
                  <div className="mt-4">
                    <Link to="/login" className="text-blue-600 hover:underline">
                      Go to login
                    </Link>
                  </div>
                </Banner>
              )}

              {!actionData?.success && (
                <Form method="post">
                  <FormLayout>
                    <TextField
                      label="New password"
                      type="password"
                      name="password"
                      value={password}
                      onChange={setPassword}
                      autoComplete="new-password"
                      helpText="Password must be at least 6 characters"
                      required
                    />
                    <TextField
                      label="Confirm password"
                      type="password"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      autoComplete="new-password"
                      required
                    />
                    <Button
                      submit
                      primary
                      fullWidth
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      Update password
                    </Button>
                  </FormLayout>
                </Form>
              )}
            </LegacyStack>
          </div>
        </Card>
      </div>
    </Page>
  );
}
