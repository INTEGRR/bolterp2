import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Card,
  LegacyStack,
  Text,
  Button,
  Layout,
  LegacyCard,
} from "@shopify/polaris";
import { requireTenant } from "~/utils/auth.server";
import { getTranslations } from "~/utils/i18n.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { tenant, user, response } = await requireTenant(request);
    const translations = await getTranslations(request);
    
    return json(
      { tenant, user, translations },
      { headers: response.headers }
    );
  } catch (error) {
    // If not authenticated, redirect to login happens in requireTenant
    return json({ tenant: null, user: null, translations: await getTranslations(request) });
  }
}

export default function Index() {
  const { tenant, user, translations } = useLoaderData<typeof loader>();
  
  const t = translations;
  const dashboard = t.dashboard || {};
  
  if (!tenant || !user) {
    return (
      <Page>
        <Card>
          <div className="p-6">
            <LegacyStack vertical spacing="loose">
              <Text variant="headingXl" as="h1">
                Manufacturing ERP System
              </Text>
              <Text>
                Please log in to access your manufacturing ERP system.
              </Text>
              <div>
                <Button primary url="/login">
                  {t.auth?.login || "Login"}
                </Button>
              </div>
            </LegacyStack>
          </div>
        </Card>
      </Page>
    );
  }
  
  return (
    <Page title={dashboard.welcome || "Welcome to your Manufacturing ERP"}>
      <Layout>
        <Layout.Section>
          <Card>
            <div className="p-6">
              <LegacyStack vertical spacing="loose">
                <Text variant="headingMd" as="h2">
                  {dashboard.quickActions || "Quick Actions"}
                </Text>
                <LegacyStack distribution="equalSpacing">
                  <Button url="/production-orders/new">
                    {dashboard.createProductionOrder || "Create Production Order"}
                  </Button>
                  <Button url="/purchase-orders/new">
                    {dashboard.createPurchaseOrder || "Create Purchase Order"}
                  </Button>
                  <Button url="/sales-orders/new">
                    {dashboard.createSalesOrder || "Create Sales Order"}
                  </Button>
                </LegacyStack>
              </LegacyStack>
            </div>
          </Card>
        </Layout.Section>
        
        <Layout.Section oneHalf>
          <LegacyCard title={dashboard.recentOrders || "Recent Orders"}>
            <LegacyCard.Section>
              <p>{t.common?.noData || "No data available"}</p>
            </LegacyCard.Section>
          </LegacyCard>
        </Layout.Section>
        
        <Layout.Section oneHalf>
          <LegacyCard title={dashboard.inventoryAlerts || "Inventory Alerts"}>
            <LegacyCard.Section>
              <p>{t.common?.noData || "No data available"}</p>
            </LegacyCard.Section>
          </LegacyCard>
        </Layout.Section>
        
        <Layout.Section>
          <LegacyCard title={dashboard.productionStatus || "Production Status"}>
            <LegacyCard.Section>
              <p>{t.common?.noData || "No data available"}</p>
            </LegacyCard.Section>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
