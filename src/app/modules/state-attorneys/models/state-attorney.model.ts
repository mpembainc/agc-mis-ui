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

export interface AttorneyAssignment {
  id: string;
  attorney_id: string;
  department_id?: string;
  entity_type: 'contract' | 'case' | 'project' | 'committee' | 'advisory';
  entity_id: string;
  title?: string;
  reference_number?: string;
  role?: string;
  start_date?: string;
  end_date?: string;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  contract?: any;
  creator?: any;
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
  avatar?: string | null;
  avatar_url?: string | null;
  status: 'active' | 'suspended' | 'seconded' | 'on_leave' | 'resigned' | 'retired' | 'deceased';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  assignments?: AttorneyAssignment[];
}
