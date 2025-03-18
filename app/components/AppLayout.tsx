import { Form, Link, useLocation, useNavigate } from "@remix-run/react";
import {
  Frame,
  Navigation,
  TopBar,
  ContextualSaveBar,
  Toast,
  ActionMenu,
  Icon,
  Text,
} from "@shopify/polaris";
import {
  HomeMajor,
  OrdersMajor,
  ProductsMajor,
  InventoryMajor,
  CustomersMajor,
  MarketingMajor,
  SettingsMajor,
  LogOutMinor,
  TransactionMajor,
  AnalyticsMajor,
  CirclePlusOutlineMinor,
  ViewMinor,
  EditMinor,
  DeleteMinor,
} from "@shopify/polaris-icons";
import type { Session } from "@supabase/supabase-js";
import { useState, useCallback, ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
  session: Session | null;
  tenant?: {
    id: number;
    name: string;
    subdomain: string;
  } | null;
  translations?: any;
  isDirty?: boolean;
  onDiscard?: () => void;
  onSave?: () => void;
  toastProps?: {
    content: string;
    error?: boolean;
  } | null;
  actionMenuProps?: {
    title: string;
    actions: {
      content: string;
      onAction: () => void;
      icon?: ReactNode;
    }[];
  } | null;
}

export default function AppLayout({
  children,
  session,
  tenant,
  translations = {},
  isDirty = false,
  onDiscard,
  onSave,
  toastProps = null,
  actionMenuProps = null,
}: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavigationActive, setMobileNavigationActive] = useState(false);
  const [userMenuActive, setUserMenuActive] = useState(false);
  const [showToast, setShowToast] = useState(!!toastProps);

  const toggleMobileNavigationActive = useCallback(
    () => setMobileNavigationActive((active) => !active),
    []
  );

  const toggleUserMenuActive = useCallback(
    () => setUserMenuActive((active) => !active),
    []
  );

  const handleDismissToast = useCallback(() => setShowToast(false), []);

  const t = translations;
  const nav = t.navigation || {};

  const userMenuActions = [
    {
      items: [
        {
          content: nav.profile || "Profile",
          url: "/profile",
        },
        {
          content: t.auth?.logout || "Logout",
          onAction: () => {
            const form = document.createElement("form");
            form.method = "post";
            form.action = "/logout";
            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
          },
          icon: LogOutMinor,
        },
      ],
    },
  ];

  const userMenuMarkup = session ? (
    <TopBar.UserMenu
      actions={userMenuActions}
      name={session.user.email?.split("@")[0] || "User"}
      detail={tenant?.name || ""}
      initials={(session.user.email?.charAt(0) || "U").toUpperCase()}
      open={userMenuActive}
      onToggle={toggleUserMenuActive}
    />
  ) : null;

  const contextualSaveBarMarkup = isDirty ? (
    <ContextualSaveBar
      message="Ungespeicherte Änderungen"
      saveAction={{
        onAction: onSave || (() => {}),
        loading: false,
        disabled: false,
      }}
      discardAction={{
        onAction: onDiscard || (() => {}),
        loading: false,
        disabled: false,
      }}
    />
  ) : null;

  const toastMarkup = showToast && toastProps ? (
    <Toast
      content={toastProps.content}
      error={toastProps.error}
      onDismiss={handleDismissToast}
    />
  ) : null;

  const actionMenuMarkup = actionMenuProps ? (
    <ActionMenu
      title={actionMenuProps.title}
      actions={actionMenuProps.actions}
    />
  ) : null;

  const navigationMarkup = (
    <Navigation location={location.pathname}>
      <Navigation.Section
        items={[
          {
            url: "/",
            label: nav.dashboard || "Dashboard",
            icon: HomeMajor,
            selected: location.pathname === "/",
          },
        ]}
      />
      
      <Navigation.Section
        title={nav.manufacturing || "Manufacturing"}
        items={[
          {
            url: "/work-centers",
            label: nav.workCenters || "Work Centers",
            icon: AnalyticsMajor,
            selected: location.pathname.startsWith("/work-centers"),
          },
          {
            url: "/production-orders",
            label: nav.productionOrders || "Production Orders",
            icon: OrdersMajor,
            selected: location.pathname.startsWith("/production-orders"),
          },
          {
            url: "/bom",
            label: nav.bom || "Bill of Materials",
            icon: ViewMinor,
            selected: location.pathname.startsWith("/bom"),
          },
        ]}
      />
      
      <Navigation.Section
        title={nav.inventory || "Inventory"}
        items={[
          {
            url: "/products",
            label: nav.products || "Products",
            icon: ProductsMajor,
            selected: location.pathname.startsWith("/products"),
          },
          {
            url: "/warehouses",
            label: nav.warehouses || "Warehouses",
            icon: InventoryMajor,
            selected: location.pathname.startsWith("/warehouses"),
          },
          {
            url: "/inventory-transactions",
            label: nav.inventoryTransactions || "Transactions",
            icon: TransactionMajor,
            selected: location.pathname.startsWith("/inventory-transactions"),
          },
        ]}
      />
      
      <Navigation.Section
        title={nav.supplyChain || "Supply Chain"}
        items={[
          {
            url: "/suppliers",
            label: nav.suppliers || "Suppliers",
            icon: MarketingMajor,
            selected: location.pathname.startsWith("/suppliers"),
          },
          {
            url: "/purchase-orders",
            label: nav.purchaseOrders || "Purchase Orders",
            icon: CirclePlusOutlineMinor,
            selected: location.pathname.startsWith("/purchase-orders"),
          },
          {
            url: "/customers",
            label: nav.customers || "Customers",
            icon: CustomersMajor,
            selected: location.pathname.startsWith("/customers"),
          },
          {
            url: "/sales-orders",
            label: nav.salesOrders || "Sales Orders",
            icon: OrdersMajor,
            selected: location.pathname.startsWith("/sales-orders"),
          },
        ]}
      />
      
      <Navigation.Section
        title={nav.shopify || "Shopify"}
        items={[
          {
            url: "/shopify-settings",
            label: nav.shopifySettings || "Settings",
            icon: SettingsMajor,
            selected: location.pathname.startsWith("/shopify-settings"),
          },
          {
            url: "/shopify-products",
            label: nav.shopifyProducts || "Products",
            icon: ProductsMajor,
            selected: location.pathname.startsWith("/shopify-products"),
          },
          {
            url: "/shopify-orders",
            label: nav.shopifyOrders || "Orders",
            icon: OrdersMajor,
            selected: location.pathname.startsWith("/shopify-orders"),
          },
        ]}
      />
      
      <Navigation.Section
        title={nav.settings || "Settings"}
        items={[
          {
            url: "/settings",
            label: nav.general || "General",
            icon: SettingsMajor,
            selected: location.pathname === "/settings",
          },
          {
            url: "/users",
            label: nav.users || "Users",
            icon: CustomersMajor,
            selected: location.pathname.startsWith("/users"),
          },
        ]}
      />
    </Navigation>
  );

  return (
    <Frame
      topBar={
        <TopBar
          showNavigationToggle
          userMenu={userMenuMarkup}
          onNavigationToggle={toggleMobileNavigationActive}
        />
      }
      navigation={navigationMarkup}
      showMobileNavigation={mobileNavigationActive}
      onNavigationDismiss={toggleMobileNavigationActive}
      skipToContentTarget={
        document.getElementById("main-content") || undefined
      }
      contextualSaveBar={contextualSaveBarMarkup}
      toast={toastMarkup}
    >
      <div id="main-content" className="p-6">
        {actionMenuMarkup}
        {children}
      </div>
    </Frame>
  );
}
