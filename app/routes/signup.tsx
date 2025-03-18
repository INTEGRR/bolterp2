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
import { createUserProfile } from "~/utils/auth.server";

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
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return json(
      { error: "Name, email, and password are required" },
      { status: 400, headers: response.headers }
    );
  }

  if (password.length < 6) {
    return json(
      { error: "Password must be at least 6 characters" },
      { status: 400, headers: response.headers }
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return json(
      { error: error.message },
      { status: 400, headers: response.headers }
    );
  }

  if (data.session) {
    // Create user profile in the profiles table
    await createUserProfile(request, data.session, name);
  }

  return json(
    { success: true, message: "Check your email to confirm your account" },
    { headers: response.headers }
  );
};

export default function SignUp() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Page>
      <div className="max-w-md mx-auto mt-12">
        <Card>
          <div className="p-6">
            <LegacyStack vertical spacing="loose">
              <Text variant="headingLg" as="h1">
                Create an account
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
                      label="Name"
                      type="text"
                      name="name"
                      value={name}
                      onChange={setName}
                      autoComplete="name"
                      required
                    />
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
                      autoComplete="new-password"
                      helpText="Password must be at least 6 characters"
                      required
                    />
                    <Button
                      submit
                      primary
                      fullWidth
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      Sign up
                    </Button>
                  </FormLayout>
                </Form>
              )}

              <div className="flex justify-center mt-4">
                <Text variant="bodyMd" as="p">
                  Already have an account?{" "}
                  <Link to="/login" className="text-blue-600 hover:underline">
                    Log in
                  </Link>
                </Text>
              </div>
            </LegacyStack>
          </div>
        </Card>
      </div>
    </Page>
  );
}
