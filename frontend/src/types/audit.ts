export interface AuditLogOut {
  id: number;
  user_id: number;
  action_type: string;
  resource_id: string;
  old_values: any | null;
  new_values: any | null;
  ip_address: string | null;
  created_at: string;
}
