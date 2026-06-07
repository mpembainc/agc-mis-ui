export interface Contract {
  id?: string;
  contract_number: string;
  mda_id: string;
  type_id?: string;
  priority_id?: string;
  partners?: string;
  subject_matter?: string;
  duration_months?: number;
  value?: number;
  strategic_interest_flag?: boolean;
  status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'signed' | 'active' | 'completed' | 'terminated';
  created_at?: string;
  updated_at?: string;
  creator?: any;
  versions?: any[];
}

export interface DashboardSummary {
  total_contracts: number;
  new_intakes: number;
  under_review: number;
  pending_approval: number;
  active_contracts: number;
  expiring_soon: number;
}

export interface LifecycleStage {
  stage: string;
  count: number;
  percentage: number;
}

export interface ContractTypeMetric {
  type: string;
  count: number;
  percentage: number;
}

export interface ContractDepartmentMetric {
  department: string;
  count: number;
  percentage: number;
}

export interface ExpiryAlert {
  title: string;
  ref: string;
  days_to_expire: number;
}

export interface ContractValueSummary {
  total_value: number;
  active_value: number;
  active_percentage: number;
  under_review_value: number;
  under_review_percentage: number;
  pending_approval_value: number;
  pending_approval_percentage: number;
}

export interface ObligationMilestone {
  status: string;
  count: number;
  percentage: number;
}

export interface RecentActivity {
  description: string;
  meta: string;
  time: string;
}

export interface TurnaroundTime {
  month: string;
  days: number;
}

export interface DocumentCategoryMetric {
  category: string;
  count: number;
  percentage: number;
}

export interface BottomMetrics {
  total_parties: number;
  active_obligations: number;
  overdue_obligations: number;
  contracts_renewed_this_year: number;
  contracts_terminated_this_year: number;
  disputes_raised: number;
  disputes_resolved: number;
}

export interface ContractDashboardData {
  summary: DashboardSummary;
  contracts_by_lifecycle_stage: LifecycleStage[];
  contracts_by_type: ContractTypeMetric[];
  contracts_by_department: ContractDepartmentMetric[];
  contracts_expiry_alerts: ExpiryAlert[];
  contract_value_summary: ContractValueSummary;
  obligations_and_milestones: ObligationMilestone[];
  recent_activities: RecentActivity[];
  review_turnaround_time: TurnaroundTime[];
  documents_by_category: DocumentCategoryMetric[];
  bottom_metrics: BottomMetrics;
}
