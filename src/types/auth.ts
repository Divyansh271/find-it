export interface User {
  user_id: string;
  email: string;
  display_name: string;
  trust_score: number;
  created_at: string;
}

export interface Session {
  user: User;
  access_token: string;
  expires_at: number;
}
