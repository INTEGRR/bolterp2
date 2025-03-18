import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
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
  Select,
} from "@shopify/polaris";
import { requireAuth } from "~/utils/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { response } = await requireAuth(request);
    return json({}, { headers: response.headers });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase, session, response } = await requireAuth(request);

  const formData = await request.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priority = formData.get("priority") as string;

  if (!title) {
    return json(
      { error: "Title is required" },
      { status: 400, headers: response.headers }
    );
  }

  const { error } = await supabase.from("tasks").insert([
    {
      title,
      description,
      priority,
      user_id: session.user.id,
      created_at: new Date().toISOString(),
    },
  ]);

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

export default function NewTask() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  const priorityOptions = [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
  ];

  return (
    <Page
      title="Create New Task"
      backAction={{ content: "Back", url: "/" }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <LegacyStack vertical spacing="loose">
              <Text variant="headingMd" as="h2">
                Task Details
              </Text>

              {actionData?.error && (
                <Banner status="critical">{actionData.error}</Banner>
              )}

              <Form method="post">
                <FormLayout>
                  <TextField
                    label="Title"
                    name="title"
                    value={title}
                    onChange={setTitle}
                    autoComplete="off"
                    required
                  />
                  <TextField
                    label="Description"
                    name="description"
                    value={description}
                    onChange={setDescription}
                    multiline={4}
                    autoComplete="off"
                  />
                  <Select
                    label="Priority"
                    name="priority"
                    options={priorityOptions}
                    value={priority}
                    onChange={setPriority}
                  />
                  <Button
                    submit
                    primary
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Create Task
                  </Button>
                </FormLayout>
              </Form>
            </LegacyStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
