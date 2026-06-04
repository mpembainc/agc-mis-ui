export interface Mda {
  id: string;
  code: string;
  name: string;
  type?: string;
}

export interface Grade {
  id: string;
  grade_name: string;
  level: number;
}

export interface LegalSpecialisation {
  id: string;
  name: string;
  description?: string;
}

export interface StateAttorney {
  id: string;
  full_name: string;
  date_of_birth?: string;
  zanid?: string;
  gender?: 'M' | 'F';
  email?: string;
  phone?: string;
  employment_type?: string;
  mda_id?: string;
  department_id?: string;
  current_grade?: string;
  current_grade_id?: string;
  bio_summary?: string;
  status: 'active' | 'suspended' | 'seconded' | 'on_leave' | 'resigned' | 'retired' | 'deceased';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  assignments?: any[];
}
