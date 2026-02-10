import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})

export type Tenant = {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export type Integration = {
  id: string
  tenant_id: string
  type: string
  status: string
  config: Record<string, any>
  last_sync_at: string | null
  created_at: string
  updated_at: string
}

export type Advisor = {
  id: string
  tenant_id: string
  external_id: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  status: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export type Client = {
  id: string
  tenant_id: string
  advisor_id: string | null
  external_id: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  status: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export type ActivityLog = {
  id: string
  tenant_id: string
  entity_type: string | null
  entity_id: string | null
  action: string
  description: string | null
  metadata: Record<string, any>
  created_at: string
}
