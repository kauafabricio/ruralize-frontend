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

// GET /feed/friends/{user_id}
export async function getFriendsFeed(userId: string): Promise<PostResponse[]> {
  const response = await api.get<PostResponse[]>(`/feed/friends/${userId}`);
  return response.data;
}
