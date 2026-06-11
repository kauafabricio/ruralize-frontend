import { api } from "./client";

export interface MessageResponse {
  message: string;
}

export interface CreatedResponse extends MessageResponse {
  id: string;
}

export interface Comment {
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
  user_photo?: string | null;
}

export interface CommentCreate {
  content: string;
}

export interface LikedUser {
  user_id: string;
  user_name: string;
  user_photo?: string | null;
}

export interface PostCreate {
  content: string;
  sustainable_action_id?: string | null;
  sustainable_action?: string;
  location?: string | null;
  event_id?: string | null;
  image_url?: string | null;
}

export interface PostUpdate {
  content?: string | null;
  location?: string | null;
  sustainable_action_id?: string | null;
  sustainable_action?: string | null;
  event_id?: string | null;
  image_url?: string | null;
}

export interface PostResponse {
  id: string;
  user_id: string;
  content: string;
  location: string | null;
  sustainable_action_id: string | null;
  sustainable_action: string;
  event_id: string | null;
  image_url: string | null;
  likes: number;
  liked_by: Array<string | LikedUser>;
  comments: Comment[];
  created_at: string;
  user_name?: string;
}

// GET /posts/
export async function getPosts(): Promise<PostResponse[]> {
  const response = await api.get<PostResponse[]>("/posts/");
  return response.data;
}

// POST /posts/
export async function createPost(
  payload: PostCreate,
): Promise<CreatedResponse> {
  const response = await api.post<CreatedResponse>("/posts/", payload);
  return response.data;
}

// GET /posts/{post_id}
export async function getPost(postId: string): Promise<PostResponse> {
  const response = await api.get<PostResponse>(`/posts/${postId}`);
  return response.data;
}

// GET /posts/ - filtrando por user_id
export async function getPostsByUser(userId: string): Promise<PostResponse[]> {
  const response = await api.get<PostResponse[]>("/posts/", {
    params: { user_id: userId },
  });
  return response.data;
}

// PUT /posts/{post_id}
export async function updatePost(
  postId: string,
  payload: PostUpdate,
): Promise<MessageResponse> {
  const response = await api.put<MessageResponse>(`/posts/${postId}`, payload);
  return response.data;
}

// DELETE /posts/{post_id}
export async function deletePost(postId: string): Promise<MessageResponse> {
  const response = await api.delete<MessageResponse>(`/posts/${postId}`);
  return response.data;
}

// POST /posts/{post_id}/like
export async function likePost(postId: string): Promise<MessageResponse> {
  const response = await api.post<MessageResponse>(`/posts/${postId}/like`);
  return response.data;
}

// DELETE /posts/{post_id}/like
export async function removeLike(postId: string): Promise<MessageResponse> {
  const response = await api.delete<MessageResponse>(`/posts/${postId}/like`);
  return response.data;
}

// POST /posts/{post_id}/comment
export async function addComment(
  postId: string,
  payload: CommentCreate,
): Promise<MessageResponse> {
  const response = await api.post<MessageResponse>(
    `/posts/${postId}/comment`,
    payload,
  );
  return response.data;
}

// DELETE /posts/{post_id}/comment/{comment_index}
export async function removeComment(
  postId: string,
  commentIndex: number,
): Promise<MessageResponse> {
  const response = await api.delete<MessageResponse>(
    `/posts/${postId}/comment/${commentIndex}`,
  );
  return response.data;
}
