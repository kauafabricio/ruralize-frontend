import { api } from "./client";
import type { UserRole } from "./auth.api";
import type { MessageResponse } from "./posts.api";

export interface ProfileAcademicInfo {
  email: string;
  registration?: string | null;
  campus_location?: string | null;
}

export interface ProfileResponse {
  id: string;
  user_id?: string | null;
  name: string;
  role: UserRole | string;
  course?: string | null;
  department?: string | null;
  description?: string | null;
  profile_photo_url?: string | null;
  cover_photo_url?: string | null;
  academic_info?: ProfileAcademicInfo | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ProfileUpdate {
  description?: string | null;
  profile_photo_url?: string | null;
  cover_photo_url?: string | null;
}

export interface UserProfileResponse {
  id: string;
  name: string;
  role: UserRole | string;
  course?: string | null;
  department?: string | null;
  profile_photo_url?: string | null;
  description?: string | null;
}

// GET /profiles/user/{user_id}
export async function getProfileByUser(
  userId: string,
): Promise<ProfileResponse> {
  try {
    const response = await api.get<ProfileResponse>(`/profiles/user/${userId}`);
    console.log(`✅ Perfil carregado para ${userId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Erro ao carregar perfil para ${userId}:`, error);
    throw error;
  }
}

// PUT /profiles/user/{user_id}
export async function updateProfile(
  userId: string,
  payload: ProfileUpdate,
): Promise<MessageResponse> {
  const response = await api.put<MessageResponse>(
    `/profiles/user/${userId}`,
    payload,
  );
  return response.data;
}

// GET /profiles/search/by-name
export async function searchProfilesByName(
  name: string,
): Promise<UserProfileResponse[]> {
  const response = await api.get<UserProfileResponse[]>(
    "/profiles/search/by-name",
    {
      params: { name },
    },
  );
  return response.data;
}

// GET /profiles/search/by-department
export async function searchProfilesByDepartment(
  department: string,
): Promise<UserProfileResponse[]> {
  const response = await api.get<UserProfileResponse[]>(
    "/profiles/search/by-department",
    {
      params: { department },
    },
  );
  return response.data;
}

// GET /profiles/search/by-role/{role}
export async function searchProfilesByRole(
  role: UserRole,
): Promise<UserProfileResponse[]> {
  const response = await api.get<UserProfileResponse[]>(
    `/profiles/search/by-role/${role}`,
  );
  return response.data;
}

// GET /profiles/
export async function getAllProfiles(): Promise<UserProfileResponse[]> {
  const response = await api.get<UserProfileResponse[]>("/profiles/");
  return response.data;
}

// GET /profiles/{profile_id}
export async function getProfile(
  profileId: string,
): Promise<UserProfileResponse> {
  const response = await api.get<UserProfileResponse>(`/profiles/${profileId}`);
  return response.data;
}
