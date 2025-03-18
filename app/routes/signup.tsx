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
import { createUserWithTenant } from "~/utils/auth.server";
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
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const companyName = formData.get("companyName") as string;
  const subdomain = formData.get("subdomain") as string;
  
  if (!email || !password || !confirmPassword || !companyName || !subdomain) {
    return json(
      { error: "All fields are required" },
      { status: 400, headers: response.headers }
    );
  }
  
  if (password !== confirmPassword) {
    return json(
      { error: "Passwords don't match" },
      { status: 400, headers: response.headers }
    );
  }
  
  try {
    await createUserWithTenant(
      email,
      password,
      companyName,
      subdomain,
      firstName,
      lastName
    );
    
    // Sign in the user
    await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return redirect("/", { headers: response.headers });
  } catch (error: any) {
    return json(
      { error: error.message },
      { status: 400, headers: response.headers }
    );
  }
}

export default function Signup() {
  const { translations } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  
  const t = translations;
  const auth = t.auth || {};
  
  return (
    <Page>
      <div className="max-w-md mx-auto mt-12">
        <Card>
          <div className="p-6">
            <LegacyStack vertical spacing="loose">
              <Text variant="headingLg" as="h1">
                {auth.register || "Register"}
              </Text>
              
              {actionData?.error && (
                <Banner status="critical">
                  {actionData.error}
                </Banner>
              )}
              
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
                  
                  <FormLayout.Group>
                    <TextField
                      label={auth.firstName || "First Name"}
                      name="firstName"
                      value={firstName}
                      onChange={setFirstName}
                      autoComplete="given-name"
                    />
                    
                    <TextField
                      label={auth.lastName || "Last Name"}
                      name="lastName"
                      value={lastName}
                      onChange={setLastName}
                      autoComplete="family-name"
                    />
                  </FormLayout.Group>
                  
                  <TextField
                    label={auth.companyName || "Company Name"}
                    name="companyName"
                    value={companyName}
                    onChange={setCompanyName}
                    required
                  />
                  
                  <TextField
                    label={auth.subdomain || "Subdomain"}
                    name="subdomain"
                    value={subdomain}
                    onChange={setSubdomain}
                    required
                    helpText="This will be used to access your tenant: subdomain.example.com"
                  />
                  
                  <TextField
                    label={auth.password || "Password"}
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
                    {auth.createAccount || "Create Account"}
                  </Button>
                </FormLayout>
              </Form>
              
              <div className="text-center">
                <Link to="/login" className="text-blue-600 hover:underline">
                  {auth.alreadyHaveAccount || "Already have an account?"}
                </Link>
              </div>
            </LegacyStack>
          </div>
        </Card>
      </div>
    </Page>
  );
}
