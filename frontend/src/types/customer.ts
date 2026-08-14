export interface CustomerOut {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CustomerCreate {
  name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
}

export interface CustomerUpdate {
  name?: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
}
