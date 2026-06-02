export interface User {
   id: number;
   reference?: string;
   user_ref: string;
   name: string;
   username: string;
   office_ref: string;
   phone_number: string;
   office_name: string;
   category_name: string;
   role: string;
   role_name: string;
   permissions: string[];
   isEnabled: boolean;
   isLocked: boolean;
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