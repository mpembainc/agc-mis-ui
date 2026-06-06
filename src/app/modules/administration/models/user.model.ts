import { Role } from './role.model';

export interface User {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  roles?: Role[];
  role_ids?: string[];
  created_at?: string;
  updated_at?: string;
}
