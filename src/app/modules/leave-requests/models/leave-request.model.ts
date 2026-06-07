export interface LeaveRequest {
  id?: string;
  attorney_id: string;
  leave_type: 'annual' | 'sick' | 'maternity' | 'paternity' | 'compassionate' | 'study' | 'unpaid';
  start_date: string;
  end_date: string;
  total_days?: number;
  reason?: string | null;
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approver_id?: string | null;
  approved_at?: string | null;
  approver_remarks?: string | null;
  attachment_document_id?: string | null;
  created_at?: string;
  updated_at?: string;
  attorney?: {
    id: string;
    full_name: string;
    email: string;
  };
  approver?: {
    id: string;
    name: string;
    email: string;
  };
}
