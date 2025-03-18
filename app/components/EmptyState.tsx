import { EmptyState as PolarisEmptyState, Card } from "@shopify/polaris";

interface EmptyStateProps {
  heading: string;
  image?: string;
  action?: {
    content: string;
    url: string;
    onAction?: () => void;
  };
  secondaryAction?: {
    content: string;
    url: string;
    onAction?: () => void;
  };
  children?: React.ReactNode;
}

export default function EmptyState({
  heading,
  image = "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png",
  action,
  secondaryAction,
  children,
}: EmptyStateProps) {
  return (
    <Card>
      <div className="p-16">
        <PolarisEmptyState
          heading={heading}
          image={image}
          action={
            action
              ? {
                  content: action.content,
                  url: action.url,
                  onAction: action.onAction,
                }
              : undefined
          }
          secondaryAction={
            secondaryAction
              ? {
                  content: secondaryAction.content,
                  url: secondaryAction.url,
                  onAction: secondaryAction.onAction,
                }
              : undefined
          }
        >
          {children}
        </PolarisEmptyState>
      </div>
    </Card>
  );
}
