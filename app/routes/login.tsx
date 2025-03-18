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
  const password = formData.get("password") as string;

  if (!email || !password) {
    return json(
      { error: "Email and password are required" },
      { status: 400, headers: response.headers }
    );
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return json(
      { error: error.message },
      { status: 400, headers: response.headers }
    );
  }

  return redirect("/", {
    headers: response.headers,
  });
};

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Page>
      <div className="max-w-md mx-auto mt-12">
        <Card>
          <div className="p-6">
            <LegacyStack vertical spacing="loose">
              <Text variant="headingLg" as="h1">
                Log in to your account
              </Text>

              {actionData?.error && (
                <Banner status="critical">{actionData.error}</Banner>
              )}

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
                  <TextField
                    label="Password"
                    type="password"
                    name="password"
                    value={password}
                    onChange={setPassword}
                    autoComplete="current-password"
                    required
                  />
                  <Button
                    submit
                    primary
                    fullWidth
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Log in
                  </Button>
                </FormLayout>
              </Form>

              <div className="flex justify-between mt-4">
                <Link to="/signup" className="text-blue-600 hover:underline">
                  Create account
                </Link>
                <Link
                  to="/reset-password"
                  className="text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </LegacyStack>
          </div>
        </Card>
      </div>
    </Page>
  );
}
