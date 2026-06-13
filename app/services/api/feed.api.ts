import { api } from "./client";
import type { PostResponse } from "./posts.api";

// GET /feed/
export async function getGeneralFeed(
  userId?: string,
): Promise<PostResponse[]> {
  const response = await api.get<PostResponse[]>("/feed/", {
    params: userId ? { user_id: userId } : undefined,
  });
  return response.data;
}

// GET /feed/following/{user_id}
export async function getFollowingFeed(userId: string): Promise<PostResponse[]> {
  const response = await api.get<PostResponse[]>(`/feed/following/${userId}`);
  return response.data;
}
