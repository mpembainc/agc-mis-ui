export interface User {
   id: number;
   name: string;
   email: string;
   mda_id: number | null;
   mda?: {
      id: number;
      code: string;
      name: string;
   } | null;
   roles: string[];
   permissions: string[];
   is_active?: boolean;
   last_login_at?: string | null;
}

export interface UserDto {
   name: string;
   username: string;
   office_ref: string;
   pwd: string;
   role: string;
}

export interface UpdateUserDto {
   name: string;
   email: string;
   authorityReference: string;
   phoneNumber: string;
}