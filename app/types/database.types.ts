export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: number
          name: string
          subdomain: string
          created_at: string
          updated_at: string
          settings: Json
          status: string
          subscription_plan: string
          subscription_end_date: string | null
        }
        Insert: {
          id?: number
          name: string
          subdomain: string
          created_at?: string
          updated_at?: string
          settings?: Json
          status?: string
          subscription_plan?: string
          subscription_end_date?: string | null
        }
        Update: {
          id?: number
          name?: string
          subdomain?: string
          created_at?: string
          updated_at?: string
          settings?: Json
          status?: string
          subscription_plan?: string
          subscription_end_date?: string | null
        }
      }
      users: {
        Row: {
          id: string
          tenant_id: number
          email: string
          first_name: string | null
          last_name: string | null
          role: string
          created_at: string
          updated_at: string
          last_login: string | null
          status: string
        }
        Insert: {
          id: string
          tenant_id: number
          email: string
          first_name?: string | null
          last_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
          last_login?: string | null
          status?: string
        }
        Update: {
          id?: string
          tenant_id?: number
          email?: string
          first_name?: string | null
          last_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
          last_login?: string | null
          status?: string
        }
      }
      roles: {
        Row: {
          id: number
          tenant_id: number
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          tenant_id: number
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          tenant_id?: number
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      permissions: {
        Row: {
          id: number
          name: string
          description: string | null
          module: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          module: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          module?: string
          created_at?: string
        }
      }
      role_permissions: {
        Row: {
          role_id: number
          permission_id: number
          created_at: string
        }
        Insert: {
          role_id: number
          permission_id: number
          created_at?: string
        }
        Update: {
          role_id?: number
          permission_id?: number
          created_at?: string
        }
      }
      user_roles: {
        Row: {
          user_id: string
          role_id: number
          created_at: string
        }
        Insert: {
          user_id: string
          role_id: number
          created_at?: string
        }
        Update: {
          user_id?: string
          role_id?: number
          created_at?: string
        }
      }
      work_centers: {
        Row: {
          id: number
          tenant_id: number
          name: string
          description: string | null
          capacity: number | null
          capacity_uom: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          tenant_id: number
          name: string
          description?: string | null
          capacity?: number | null
          capacity_uom?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          tenant_id?: number
          name?: string
          description?: string | null
          capacity?: number | null
          capacity_uom?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: number
          tenant_id: number
          sku: string
          name: string
          description: string | null
          product_type: string
          uom: string
          cost: number | null
          price: number | null
          min_stock: number | null
          max_stock: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          tenant_id: number
          sku: string
          name: string
          description?: string | null
          product_type: string
          uom: string
          cost?: number | null
          price?: number | null
          min_stock?: number | null
          max_stock?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          tenant_id?: number
          sku?: string
          name?: string
          description?: string | null
          product_type?: string
          uom?: string
          cost?: number | null
          price?: number | null
          min_stock?: number | null
          max_stock?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      // Add more table definitions for all tables in the schema
      // This is a partial definition for brevity
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
