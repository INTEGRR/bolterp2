import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useActionData, useNavigation } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  Banner,
  LegacyStack,
  Text,
} from "@shopify/polaris";
import { requireAuth } from "~/utils/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { supabase, session, response } = await requireAuth(request);

    // Fetch user profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return json(
        { session, profile: null, error: "Failed to load profile" },
        { headers: response.headers }
      );
    }

    return json(
      { session, profile },
      { headers: response.headers }
    );
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase, session, response } = await requireAuth(request);

  const formData = await request.formData();
  const name = formData.get("name") as string;

  if (!name) {
    return json(
      { error: "Name is required" },
      { status: 400, headers: response.headers }
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", session.user.id);

  if (error) {
    return json(
      { error: error.message },
      { status: 400, headers: response.headers }
    );
  }

  return json(
    { success: true, message: "Profile updated successfully" },
    { headers: response.headers }
  );
};

export default function Profile() {
  const { profile } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [name, setName] = useState(profile?.name || "");

  return (
    <Page
      title="My Profile"
      backAction={{ content: "Back", url: "/" }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <LegacyStack vertical spacing="loose">
              <Text variant="headingMd" as="h2">
                Profile Information
              </Text>

              {actionData?.error && (
                <Banner status="critical">{actionData.error}</Banner>
              )}

              {actionData?.success && (
                <Banner status="success">{actionData.message}</Banner>
              )}

              <Form method="post">
                <FormLayout>
                  <TextField
                    label="Email"
                    value={profile?.email || ""}
                    disabled
                    readOnly
                  />
                  <TextField
                    label="Name"
                    name="name"
                    value={name}
                    onChange={setName}
                    required
                  />
                  <Button
                    submit
                    primary
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Save
                  </Button>
                </FormLayout>
              </Form>
            </LegacyStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <LegacyStack vertical spacing="loose">
              <Text variant="headingMd" as="h2">
                Account Management
              </Text>
              <Form method="post" action="/logout">
                <Button destructive submit>
                  Log out
                </Button>
              </Form>
            </LegacyStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
