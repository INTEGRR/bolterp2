import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  EmptyState,
  LegacyStack,
  Text,
} from "@shopify/polaris";
import { createServerClient } from "~/utils/supabase.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Supabase Polaris App" },
    { name: "description", content: "A full-stack application with Supabase and Shopify Polaris" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response();
  const supabase = createServerClient({ request, response });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return json({ session: null }, { headers: response.headers });
  }

  // Fetch user's tasks from Supabase
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  return json(
    { session, tasks: tasks || [] },
    { headers: response.headers }
  );
};

export default function Index() {
  const { session, tasks } = useLoaderData<typeof loader>();

  if (!session) {
    return (
      <Page>
        <Layout>
          <Layout.Section>
            <Card>
              <EmptyState
                heading="Welcome to the Supabase Polaris App"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                action={{ content: "Log in", url: "/login" }}
                secondaryAction={{ content: "Sign up", url: "/signup" }}
              >
                <p>
                  Please log in or sign up to start using the application.
                </p>
              </EmptyState>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page
      title="Dashboard"
      primaryAction={
        <Button primary url="/tasks/new">
          Create Task
        </Button>
      }
      secondaryActions={[
        {
          content: "My Profile",
          url: "/profile",
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <LegacyStack vertical>
              <LegacyStack.Item>
                <Text variant="headingMd" as="h2">
                  Welcome back, {session.user.email}
                </Text>
              </LegacyStack.Item>
              <LegacyStack.Item>
                <Text variant="bodyMd" as="p">
                  You have {tasks.length} tasks in your list.
                </Text>
              </LegacyStack.Item>
            </LegacyStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          {tasks.length === 0 ? (
            <Card>
              <EmptyState
                heading="You don't have any tasks yet"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                action={{ content: "Create task", url: "/tasks/new" }}
              >
                <p>
                  Create your first task to start managing your work.
                </p>
              </EmptyState>
            </Card>
          ) : (
            <Card>
              <LegacyStack vertical>
                {tasks.map((task) => (
                  <LegacyStack.Item key={task.id}>
                    <Link to={`/tasks/${task.id}`}>
                      <Card>
                        <LegacyStack>
                          <LegacyStack.Item fill>
                            <Text variant="headingSm" as="h3">
                              {task.title}
                            </Text>
                            <Text variant="bodyMd" as="p">
                              {task.description}
                            </Text>
                          </LegacyStack.Item>
                          <LegacyStack.Item>
                            <Text variant="bodyMd" as="p">
                              {new Date(task.created_at).toLocaleDateString()}
                            </Text>
                          </LegacyStack.Item>
                        </LegacyStack>
                      </Card>
                    </Link>
                  </LegacyStack.Item>
                ))}
              </LegacyStack>
            </Card>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
