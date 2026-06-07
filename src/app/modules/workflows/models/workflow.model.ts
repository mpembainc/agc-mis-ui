export interface WorkflowDefinition {
  id: string;
  name: string;
  states: string[];
  transitions: Record<string, string[]>;
  created_at?: string;
  updated_at?: string;
}

export interface WorkflowTask {
  id: string;
  workflow_instance_id: string;
  node_name: string;
  assigned_user_id: string | null;
  role_id: string | null;
  start_time: string | null;
  end_time: string | null;
  working_days: number | null;
  is_return: boolean;
  comments: string | null;
  created_at?: string;
  updated_at?: string;
  // UI extended properties
  assigned_user?: {
    id: string;
    name: string;
    email: string;
  };
  role?: {
    id: string;
    name: string;
    display_name: string;
  };
}

export interface WorkflowInstance {
  id: string;
  workflow_definition_id: string;
  entity_type: string;
  entity_id: string;
  current_state: string;
  created_at: string;
  updated_at: string;
  tasks?: WorkflowTask[];
  definition?: WorkflowDefinition;
  
  // UI helpers
  entity_name?: string; // e.g. Contract Number or Attorney Name/Leave Type
  entity_detail?: string; // description/details
}
