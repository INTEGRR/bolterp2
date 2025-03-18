import { useState, useCallback } from "react";
import {
  IndexTable,
  Card,
  Filters,
  Button,
  Pagination,
  Text,
  Badge,
  useIndexResourceState,
  EmptySearchResult,
  LegacyStack,
} from "@shopify/polaris";
import { Link } from "@remix-run/react";

interface DataTableProps {
  items: any[];
  resourceName: {
    singular: string;
    plural: string;
  };
  columns: {
    title: string;
    key: string;
    renderItem?: (item: any) => React.ReactNode;
  }[];
  filterOptions?: {
    key: string;
    label: string;
    filter: React.ReactNode;
    shortcut?: boolean;
  }[];
  sortOptions?: {
    label: string;
    value: string;
    directionLabel: string;
  }[];
  bulkActions?: {
    content: string;
    onAction: (ids: string[]) => void;
    destructive?: boolean;
  }[];
  rowActions?: {
    content: string;
    url?: string;
    onAction?: (id: string) => void;
    destructive?: boolean;
  }[];
  createUrl?: string;
  createLabel?: string;
  pagination?: {
    hasPrevious: boolean;
    hasNext: boolean;
    onPrevious: () => void;
    onNext: () => void;
  };
  loading?: boolean;
  emptyState?: React.ReactNode;
  translations?: any;
}

export default function DataTable({
  items,
  resourceName,
  columns,
  filterOptions = [],
  sortOptions = [],
  bulkActions = [],
  rowActions = [],
  createUrl,
  createLabel,
  pagination,
  loading = false,
  emptyState,
  translations = {},
}: DataTableProps) {
  const [queryValue, setQueryValue] = useState("");
  const [sortSelected, setSortSelected] = useState(
    sortOptions.length > 0 ? sortOptions[0].value : ""
  );

  const handleQueryValueChange = useCallback(
    (value: string) => setQueryValue(value),
    []
  );

  const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);

  const handleClearAll = useCallback(() => {
    handleQueryValueRemove();
  }, [handleQueryValueRemove]);

  const resourceNameForMessages = {
    singular: translations[resourceName.singular] || resourceName.singular,
    plural: translations[resourceName.plural] || resourceName.plural,
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(items);

  const emptyStateMarkup = emptyState || (
    <EmptySearchResult
      title={`No ${resourceNameForMessages.plural} found`}
      description={`Try changing the filters or search term`}
      withIllustration
    />
  );

  const rowMarkup = items.map((item, index) => (
    <IndexTable.Row
      id={item.id.toString()}
      key={item.id}
      selected={selectedResources.includes(item.id.toString())}
      position={index}
    >
      {columns.map((column) => (
        <IndexTable.Cell key={`${item.id}-${column.key}`}>
          {column.renderItem ? column.renderItem(item) : item[column.key]}
        </IndexTable.Cell>
      ))}
    </IndexTable.Row>
  ));

  const bulkActionsMarkup = bulkActions.map((action) => ({
    content: action.content,
    onAction: () => action.onAction(selectedResources),
    destructive: action.destructive,
  }));

  const promotedBulkActions = bulkActionsMarkup.length > 0 ? bulkActionsMarkup.slice(0, 2) : undefined;
  const bulkActionsMenu = bulkActionsMarkup.length > 2 ? bulkActionsMarkup.slice(2) : undefined;

  return (
    <Card>
      <div className="p-5">
        <LegacyStack distribution="equalSpacing" alignment="center">
          <Text variant="headingMd" as="h2">
            {resourceNameForMessages.plural}
          </Text>
          {createUrl && (
            <Button primary url={createUrl}>
              {createLabel || `Add ${resourceNameForMessages.singular}`}
            </Button>
          )}
        </LegacyStack>
      </div>
      <div className="p-5 pt-0">
        <Filters
          queryValue={queryValue}
          queryPlaceholder={`Search ${resourceNameForMessages.plural.toLowerCase()}`}
          filters={filterOptions}
          onQueryChange={handleQueryValueChange}
          onQueryClear={handleQueryValueRemove}
          onClearAll={handleClearAll}
        />
      </div>

      <IndexTable
        resourceName={resourceNameForMessages}
        itemCount={items.length}
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        headings={columns.map((column) => ({ title: column.title }))}
        promotedBulkActions={promotedBulkActions}
        bulkActions={bulkActionsMenu}
        emptyState={emptyStateMarkup}
        loading={loading}
      >
        {rowMarkup}
      </IndexTable>

      {pagination && (
        <div className="p-5 flex justify-center">
          <Pagination
            hasPrevious={pagination.hasPrevious}
            onPrevious={pagination.onPrevious}
            hasNext={pagination.hasNext}
            onNext={pagination.onNext}
          />
        </div>
      )}
    </Card>
  );
}
