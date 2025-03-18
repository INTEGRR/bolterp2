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
  Select,
  ButtonGroup,
  Modal,
} from "@shopify/polaris";
import { requireAuth } from "~/utils/auth.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  try {
    const { supabase, response } = await requireAuth(request);
    const { id } = params;

    if (!id) {
      return redirect("/", {
        headers: response.headers,
      });
    }

    const { data: task, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !task) {
      return redirect("/", {
        headers: response.headers,
      });
    }

    return json(
      { task },
      { headers: response.headers }
    );
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { supabase, response } = await requireAuth(request);
  const { id } = params;

  if (!id) {
    return redirect("/", {
      headers: response.headers,
    });
  }

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "delete") {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    if (error) {
      return json(
        { error: error.message },
        { status: 400, headers: response.headers }
      );
    }

    return redirect("/", {
      headers: response.headers,
    });
  } else {
    // Update task
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as string;
    const status = formData.get("status") as string;

    if (!title) {
      return json(
        { error: "Title is required" },
        { status: 400, headers: response.headers }
      );
    }

    const { error } = await supabase
      .from("tasks")
      .update({
        title,
        description,
        priority,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return json(
        { error: error.message },
        { status: 400, headers: response.headers }
      );
    }

    return json(
      { success: true, message: "Task updated successfully" },
      { headers: response.headers }
    );
  }
};

export default function TaskDetails() {
  const { task } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority || "medium");
  const [status, setStatus] = useState(task.status || "pending");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const priorityOptions = [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
  ];

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
  ];

  return (
    <Page
      title="Task Details"
      backAction={{ content: "Back", url: "/" }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <LegacyStack vertical spacing="loose">
              <Text variant="headingMd" as="h2">
                Edit Task
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
                  <Select
                    label="Status"
                    name="status"
                    options={statusOptions}
                    value={status}
                    onChange={setStatus}
                  />
                  <ButtonGroup>
                    <Button
                      submit
                      primary
                      loading={isSubmitting && !showDeleteModal}
                      disabled={isSubmitting}
                    >
                      Save
                    </Button>
                    <Button
                      destructive
                      onClick={() => setShowDeleteModal(true)}
                      disabled={isSubmitting}
                    >
                      Delete
                    </Button>
                  </ButtonGroup>
                </FormLayout>
              </Form>
            </LegacyStack>
          </Card>
        </Layout.Section>
      </Layout>

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Task"
        primaryAction={{
          content: "Delete",
          destructive: true,
          loading: isSubmitting && showDeleteModal,
          onAction: () => {
            const form = document.createElement("form");
            form.method = "post";
            
            const intentInput = document.createElement("input");
            intentInput.type = "hidden";
            intentInput.name = "intent";
            intentInput.value = "delete";
            
            form.appendChild(intentInput);
            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
          },
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setShowDeleteModal(false),
          },
        ]}
      >
        <Modal.Section>
          <Text variant="bodyMd" as="p">
            Are you sure you want to delete this task? This action cannot be undone.
          </Text>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
