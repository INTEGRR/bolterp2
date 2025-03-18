import { useState, useCallback } from "react";
import { Form as RemixForm, useNavigation } from "@remix-run/react";
import {
  Card,
  FormLayout as PolarisFormLayout,
  Button,
  Text,
  Banner,
  LegacyStack,
} from "@shopify/polaris";

interface FormLayoutProps {
  title: string;
  children: React.ReactNode;
  primaryAction: {
    content: string;
    loading?: boolean;
    disabled?: boolean;
  };
  secondaryActions?: {
    content: string;
    url?: string;
    onAction?: () => void;
    loading?: boolean;
    disabled?: boolean;
    destructive?: boolean;
  }[];
  error?: string | null;
  success?: string | null;
  method?: "get" | "post" | "put" | "delete";
  action?: string;
  encType?: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  translations?: any;
}

export default function FormLayout({
  title,
  children,
  primaryAction,
  secondaryActions = [],
  error = null,
  success = null,
  method = "post",
  action,
  encType,
  onSubmit,
  translations = {},
}: FormLayoutProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const t = translations;
  const common = t.common || {};

  const formMarkup = (
    <PolarisFormLayout>
      {error && (
        <Banner title={t.errors?.error || "Error"} status="critical">
          {error}
        </Banner>
      )}

      {success && (
        <Banner title={common.success || "Success"} status="success">
          {success}
        </Banner>
      )}

      {children}

      <PolarisFormLayout.Group condensed>
        <LegacyStack distribution="trailing">
          {secondaryActions.map((action, index) => (
            <Button
              key={`secondary-action-${index}`}
              url={action.url}
              onClick={action.onAction}
              loading={action.loading || isSubmitting}
              disabled={action.disabled || isSubmitting}
              destructive={action.destructive}
            >
              {action.content}
            </Button>
          ))}
          <Button
            primary
            submit
            loading={primaryAction.loading || isSubmitting}
            disabled={primaryAction.disabled || isSubmitting}
          >
            {primaryAction.content}
          </Button>
        </LegacyStack>
      </PolarisFormLayout.Group>
    </PolarisFormLayout>
  );

  return (
    <Card>
      <div className="p-5">
        <Text variant="headingMd" as="h2">
          {title}
        </Text>
      </div>
      <div className="px-5 pb-5">
        {action || onSubmit ? (
          <RemixForm
            method={method}
            action={action}
            encType={encType}
            onSubmit={onSubmit}
          >
            {formMarkup}
          </RemixForm>
        ) : (
          formMarkup
        )}
      </div>
    </Card>
  );
}
