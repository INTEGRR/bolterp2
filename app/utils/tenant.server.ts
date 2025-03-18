import { createServerSupabaseClient } from './supabase.server';
import type { Session } from '@supabase/supabase-js';

export async function getCurrentTenant(request: Request) {
  const response = new Response();
  const supabase = createServerSupabaseClient({ request, response });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return { tenant: null, user: null, response };
  }
  
  const { data: user } = await supabase
    .from('users')
    .select('tenant_id, role')
    .eq('id', session.user.id)
    .single();
  
  if (!user || !user.tenant_id) {
    return { tenant: null, user: null, response };
  }
  
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', user.tenant_id)
    .single();
  
  return { tenant, user, response };
}

export async function getTenantBySubdomain(subdomain: string) {
  const supabase = createServerSupabaseClient({ 
    request: new Request('http://localhost'), 
    response: new Response() 
  });
  
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('subdomain', subdomain)
    .eq('status', 'active')
    .single();
  
  return tenant;
}

export async function getUserTenants(session: Session) {
  const supabase = createServerSupabaseClient({ 
    request: new Request('http://localhost'), 
    response: new Response() 
  });
  
  const { data: userTenants } = await supabase
    .from('users')
    .select(`
      tenant_id,
      tenants:tenant_id (
        id,
        name,
        subdomain,
        status,
        subscription_plan
      )
    `)
    .eq('id', session.user.id);
  
  return userTenants?.map(ut => ut.tenants) || [];
}
