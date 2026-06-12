import { api } from "./client";

export type UserRole = "student" | "teacher";

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  role: UserRole | string;
  registration?: string | null;
  department?: string | null;
  campus_location?: string | null;
  description?: string | null;
  profile_photo_url?: string | null;
  cover_photo_url?: string | null;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  access_token?: string;
  accessToken?: string;
  jwt?: string;
  user?: Record<string, unknown>;
  message?: string;
  [key: string]: unknown;
}

export interface ProfileCompletionStatus {
  completed: boolean;
  missing_fields: string[];
  required_fields: string[];
  optional_fields: string[];
}

// POST /auth/register
export async function registerUser(payload: UserCreate): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/register", payload);
  return response.data;
}

// POST /auth/login
export async function loginUser(payload: UserLogin): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login", payload);
  return response.data;
}

// GET /auth/profile-completion-status/{user_id}
export async function getProfileCompletionStatus(userId: string): Promise<ProfileCompletionStatus> {
  const response = await api.get<ProfileCompletionStatus>(`/auth/profile-completion-status/${userId}`);
  return response.data;
}
