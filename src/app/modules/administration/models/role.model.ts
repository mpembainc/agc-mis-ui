export interface Permission {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  module: string;
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  is_system: boolean;
  permissions?: Permission[];
  created_at?: string;
  updated_at?: string;
}
