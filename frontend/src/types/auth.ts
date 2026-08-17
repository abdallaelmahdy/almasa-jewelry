export interface User {
  id: number;
  username: string;
  email: string;
  role: "admin" | "employee" | "customer";
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ErrorResponse {
  detail: string | { loc: string[]; msg: string; type: string }[];
}
