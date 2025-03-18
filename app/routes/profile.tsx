import { useState } from "react";
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import {
  Page,
  Card,
  FormLayout,
  TextField,
  Button,
  Text,
  LegacyStack,
  Banner,
  Layout,
} from "@shopify/polaris";
import { requireUser } from "~/utils/auth.server";
import { createServerSupabaseClient } from "~/utils/supabase.server";
import { getTranslations } from "~/utils/i18n.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, session, response } = await requireUser(request);
  const translations = await getTranslations(request);
  
  return json(
    { user, session, translations },
    { headers: response.headers }
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const { user, session, response } = await requireUser(request);
  const supabase = createServerSupabaseClient({ request, response });
  
  const formData = await request.formData();
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  
  const formType = formData.get("formType") as string;
  
  if (formType === "profile") {
    // Update profile
    const { error } = await supabase
      .from("users")
      .update({
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    
    if (error) {
      return json(
        { profileError: error.message },
        { status: 400, headers: response.headers }
      );
    }
    
    return json(
      { profileSuccess: true },
      { headers: response.headers }
    );
  } else if (formType === "password") {
    // Update password
    if (!currentPassword) {
      return json(
        { passwordError: "Current password is required" },
        { status: 400, headers: response.headers }
      );
    }
    
    if (!newPassword || !confirmPassword) {
      return json(
        { passwordError: "New password and confirmation are required" },
        { status: 400, headers: response.headers }
      );
    }
    
    if (newPassword !== confirmPassword) {
      return json(
        { passwordError: "Passwords don't match" },
        { status: 400, headers: response.headers }
      );
    }
    
    // Verify current password by trying to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    
    if (signInError) {
      return json(
        { passwordError: "Current password is incorrect" },
        { status: 400, headers: response.headers }
      );
    }
    
    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) {
      return json(
        { passwordError: error.message },
        { status: 400, headers: response.headers }
      );
    }
    
    return json(
      { passwordSuccess: true },
      { headers: response.headers }
    );
  }
  
  return json(
    { error: "Invalid form type" },
    { status: 400, headers: response.headers }
  );
}

export default function Profile() {
  const { user, translations } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  
  const [firstName, setFirstName] = useState(user.first_name || "");
  const [lastName, setLastName] = useState(user.last_name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const t = translations;
  const auth = t.auth || {};
  
  return (
    <Page title={t.navigation?.profile || "Profile"}>
      <Layout>
        <Layout.Section>
          <Card>
            <div className="p-6">
              <LegacyStack vertical spacing="loose">
                <Text variant="headingMd" as="h2">
                  {t.navigation?.profile || "Profile Information"}
                </Text>
                
                {actionData?.profileError && (
                  <Banner status="critical">
                    {actionData.profileError}
                  </Banner>
                )}
                
                {actionData?.profileSuccess && (
                  <Banner status="success">
                    {t.common?.success || "Profile updated successfully"}
                  </Banner>
                )}
                
                <Form method="post">
                  <input type="hidden" name="formType" value="profile" />
                  <FormLayout>
                    <TextField
                      label={auth.email || "Email"}
                      value={user.email}
                      disabled
                    />
                    
                    <FormLayout.Group>
                      <TextField
                        label={auth.firstName || "First Name"}
                        name="firstName"
                        value={firstName}
                        onChange={setFirstName}
                      />
                      
                      <TextField
                        label={auth.lastName || "Last Name"}
                        name="lastName"
                        value={lastName}
                        onChange={setLastName}
                      />
                    </FormLayout.Group>
                    
                    <div className="flex justify-end">
                      <Button primary submit>
                        {t.common?.save || "Save"}
                      </Button>
                    </div>
                  </FormLayout>
                </Form>
              </LegacyStack>
            </div>
          </Card>
        </Layout.Section>
        
        <Layout.Section>
          <Card>
            <div className="p-6">
              <LegacyStack vertical spacing="loose">
                <Text variant="headingMd" as="h2">
                  {auth.resetPassword || "Change Password"}
                </Text>
                
                {actionData?.passwordError && (
                  <Banner status="critical">
                    {actionData.passwordError}
                  </Banner>
                )}
                
                {actionData?.passwordSuccess && (
                  <Banner status="success">
                    {auth.passwordResetSuccess || "Password updated successfully"}
                  </Banner>
                )}
                
                <Form method="post">
                  <input type="hidden" name="formType" value="password" />
                  <FormLayout>
                    <TextField
                      label={t.auth?.password || "Current Password"}
                      type="password"
                      name="currentPassword"
                      value={currentPassword}
                      onChange={setCurrentPassword}
                      autoComplete="current-password"
                    />
                    
                    <TextField
                      label={auth.newPassword || "New Password"}
                      type="password"
                      name="newPassword"
                      value={newPassword}
                      onChange={setNewPassword}
                      autoComplete="new-password"
                    />
                    
                    <TextField
                      label={auth.confirmPassword || "Confirm Password"}
                      type="password"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      autoComplete="new-password"
                    />
                    
                    <div className="flex justify-end">
                      <Button primary submit>
                        {t.common?.save || "Save"}
                      </Button>
                    </div>
                  </FormLayout>
                </Form>
              </LegacyStack>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
