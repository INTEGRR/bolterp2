import { Form } from "@remix-run/react";
import {
  Frame,
  Navigation,
  TopBar,
  Avatar,
  Icon,
} from "@shopify/polaris";
import {
  HomeMajor,
  OrdersMajor,
  CustomersMajor,
  SettingsMajor,
  LogOutMinor,
} from "@shopify/polaris-icons";
import type { Session } from "@supabase/supabase-js";
import { useState, useCallback } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
  session: Session | null;
}

export default function AppLayout({ children, session }: AppLayoutProps) {
  const [mobileNavigationActive, setMobileNavigationActive] = useState(false);
  const [userMenuActive, setUserMenuActive] = useState(false);

  const toggleMobileNavigationActive = useCallback(
    () => setMobileNavigationActive((active) => !active),
    []
  );

  const toggleUserMenuActive = useCallback(
    () => setUserMenuActive((active) => !active),
    []
  );

  const userMenuActions = [
    {
      items: [
        {
          content: "My Profile",
          url: "/profile",
        },
        {
          content: "Log out",
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
      detail={session.user.email}
      initials={(session.user.email?.charAt(0) || "U").toUpperCase()}
      open={userMenuActive}
      onToggle={toggleUserMenuActive}
    />
  ) : null;

  const navigationMarkup = (
    <Navigation location="/">
      <Navigation.Section
        items={[
          {
            url: "/",
            label: "Home",
            icon: HomeMajor,
          },
          {
            url: "/tasks/new",
            label: "New Task",
            icon: OrdersMajor,
          },
          {
            url: "/profile",
            label: "Profile",
            icon: CustomersMajor,
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
    >
      {children}
    </Frame>
  );
}
