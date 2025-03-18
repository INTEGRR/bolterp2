import { createServerClient } from '@supabase/auth-helpers-remix';
import type { Database } from '~/types/database.types';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

export type TypedSupabaseClient = SupabaseClient<Database>;

export const createServerSupabaseClient = ({
  request,
  response,
}: {
  request: Request;
  response: Response;
}): TypedSupabaseClient => {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
  
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    { request, response }
  );
};

export async function getSession(request: Request): Promise<Session | null> {
  const response = new Response();
  const supabase = createServerSupabaseClient({ request, response });
  
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function requireAuth(request: Request): Promise<{ 
  session: Session; 
  supabase: TypedSupabaseClient;
  response: Response;
}> {
  const response = new Response();
  const supabase = createServerSupabaseClient({ request, response });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Response('Unauthorized', { status: 401 });
  }
  
  return { session, supabase, response };
}

export async function requireTenantAccess(
  request: Request, 
  tenantId: number
): Promise<{ 
  session: Session; 
  supabase: TypedSupabaseClient;
  response: Response;
  user: { id: string; tenant_id: number; role: string };
}> {
  const { session, supabase, response } = await requireAuth(request);
  
  const { data: user, error } = await supabase
    .from('users')
    .select('id, tenant_id, role')
    .eq('id', session.user.id)
    .single();
  
  if (error || !user || user.tenant_id !== tenantId) {
    throw new Response('Forbidden', { status: 403 });
  }
  
  return { session, supabase, response, user };
}
