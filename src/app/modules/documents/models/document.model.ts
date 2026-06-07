import { User } from '../../auth/user.model';

export interface Document {
  id: string;
  entity_type: string | null;
  entity_id: string | null;
  document_type_id: string | null;
  original_name: string;
  stored_name: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  storage_disk: string;
  version_number: number;
  is_active: boolean;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
  uploader?: User;
}

export interface DocumentAccessLog {
  id: string;
  document_id: string;
  user_id: number;
  action: 'view' | 'download' | 'version_uploaded';
  ip_address: string;
  accessed_at: string;
  user?: User;
}

export interface DocumentType {
  id: string;
  type_name: string;
  allowed_mime_types: string;
  max_size_mb: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
