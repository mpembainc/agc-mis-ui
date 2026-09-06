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
  accomplishments?: Accomplishment[];
  education?: AttorneyEducation[];
  certifications?: AttorneyCertification[];
  dossier_documents?: DossierDocument[];
  cv_document_id?: string | null;
  cv_document?: DossierDocument;
}

export interface AccomplishmentType {
  id: string;
  type_name: string;
  entity_type?: string | null;
  is_active: boolean;
}

export interface Accomplishment {
  id: string;
  attorney_id: string;
  type_id: string;
  entity_type?: string | null;
  entity_id?: string | null;
  description: string;
  quantity: number;
  date: string;
  matter_title?: string | null;
  accomplishment_type?: AccomplishmentType;
  contract?: any;
  attorney?: StateAttorney;
  created_at?: string;
  updated_at?: string;
}

export interface AccomplishmentStats {
  total_count: number;
  total_quantity: number;
  this_month_count: number;
  by_type: {
    type_name: string;
    count: number;
    total_units: number;
  }[];
}

export interface DocumentTypeLookup {
  id: string;
  type_name: string;
  allowed_mime_types?: string | null;
  max_size_mb?: number | null;
  is_active?: boolean;
}

export interface DossierDocument {
  id: string;
  entity_type?: string;
  entity_id?: string;
  document_type_id?: string | null;
  original_name: string;
  stored_name?: string;
  mime_type?: string | null;
  size_bytes?: number | null;
  file_size_formatted?: string;
  storage_path?: string;
  created_at?: string;
  document_type?: DocumentTypeLookup;
  uploader?: {
    id: string;
    first_name?: string;
    last_name?: string;
    name?: string;
    email?: string;
  };
}

export interface AttorneyEducation {
  id: string;
  attorney_id: string;
  institution_id?: string | null;
  institution_name: string;
  education_level: string;
  degree: string;
  graduation_year: number;
  certificate_document_id?: string | null;
  is_verified: boolean;
  created_at?: string;
  updated_at?: string;
  certificate_document?: DossierDocument;
  institution?: {
    id: string;
    name: string;
  };
}

export interface AttorneyCertification {
  id: string;
  attorney_id: string;
  certification_name: string;
  issuing_body?: string | null;
  issue_date?: string | null;
  expiry_date?: string | null;
  certificate_document_id?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  certificate_document?: DossierDocument;
}

export interface QualificationsSummary {
  total_degrees: number;
  verified_degrees: number;
  total_certifications: number;
  active_certifications: number;
  highest_level: string;
}

export interface QualificationsData {
  education: AttorneyEducation[];
  certifications: AttorneyCertification[];
  summary: QualificationsSummary;
}

export interface DossierSummary {
  total_files: number;
  total_size_formatted: string;
  categories_count: number;
  last_uploaded_at?: string | null;
}

export interface DossierData {
  documents: DossierDocument[];
  summary: DossierSummary;
}

export interface DashboardSummary {
  total_state_attorneys: number;
  new_this_month: number;
  active_assignments: number;
  on_leave: number;
  avg_performance: string;
  eligible_for_promotion: number;
}

export interface DeploymentStatusMetric {
  status: string;
  count: number;
  percentage: number;
}

export interface AssignmentsTrendMetric {
  month: string;
  assigned: number;
  completed: number;
}

export interface WorkloadDistributionMetric {
  range: string;
  count: number;
  percentage: number;
}

export interface UpcomingLeaveMetric {
  attorney_name: string;
  start_date: string;
  end_date: string;
  leave_type: string;
}

export interface PromotionEligibilityMetric {
  status: string;
  count: number;
  percentage: number;
}

export interface RecentActivityMetric {
  description: string;
  meta: string | null;
  time: string;
}

export interface DashboardPerformanceMetrics {
  total_advice_issued_this_month: number;
  pending_reviews: number;
  overdue_assignments: number;
  avg_turnaround_time_days: number;
  satisfaction_rating: number;
}

export interface StateAttorneyDashboardData {
  summary: DashboardSummary;
  attorneys_by_deployment_status: DeploymentStatusMetric[];
  assignments_overview: AssignmentsTrendMetric[];
  workload_distribution: WorkloadDistributionMetric[];
  upcoming_leaves: UpcomingLeaveMetric[];
  promotion_eligibility_status: PromotionEligibilityMetric[];
  recent_activities: RecentActivityMetric[];
  performance_metrics: DashboardPerformanceMetrics;
}
