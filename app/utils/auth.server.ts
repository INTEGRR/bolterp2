import { redirect } from '@remix-run/node';
import { createServerSupabaseClient } from './supabase.server';
import { getCurrentTenant } from './tenant.server';

export async function requireUser(request: Request) {
  const response = new Response();
  const supabase = createServerSupabaseClient({ request, response });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw redirect('/login');
  }
  
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  if (!user) {
    throw redirect('/login');
  }
  
  return { user, session, response };
}

export async function requireTenant(request: Request) {
  const { tenant, user, response } = await getCurrentTenant(request);
  
  if (!tenant || !user) {
    throw redirect('/login');
  }
  
  return { tenant, user, response };
}

export async function requireRole(request: Request, allowedRoles: string[]) {
  const { user, session, response } = await requireUser(request);
  
  if (!allowedRoles.includes(user.role)) {
    throw new Response('Forbidden', { status: 403 });
  }
  
  return { user, session, response };
}

export async function createUserWithTenant(
  email: string,
  password: string,
  tenantName: string,
  subdomain: string,
  firstName?: string,
  lastName?: string
) {
  const supabase = createServerSupabaseClient({ 
    request: new Request('http://localhost'), 
    response: new Response() 
  });
  
  // Create user in auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (authError || !authData.user) {
    throw new Error(authError?.message || 'Failed to create user');
  }
  
  // Create tenant
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .insert({
      name: tenantName,
      subdomain,
      status: 'active',
      subscription_plan: 'basic'
    })
    .select()
    .single();
  
  if (tenantError || !tenant) {
    // Rollback user creation
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error(tenantError?.message || 'Failed to create tenant');
  }
  
  // Update user with tenant_id and additional info
  const { error: userError } = await supabase
    .from('users')
    .update({
      tenant_id: tenant.id,
      first_name: firstName,
      last_name: lastName,
      role: 'admin' // First user is admin
    })
    .eq('id', authData.user.id);
  
  if (userError) {
    // Rollback tenant and user creation
    await supabase.from('tenants').delete().eq('id', tenant.id);
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error(userError.message);
  }
  
  return { user: authData.user, tenant };
}
