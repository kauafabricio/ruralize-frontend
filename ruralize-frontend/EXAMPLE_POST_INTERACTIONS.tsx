// Example: PostCard Component with Like/Comment Integration
// This shows how to implement post interactions using the service layer

import { useState } from "react";
import {
  likePost,
  removeLike,
  addComment,
  removeComment,
  type CommentCreate,
  type PostResponse,
} from "@/app/services/api/posts.api";
import { useAuth } from "@/app/components/auth/AuthProvider";

interface PostCardProps {
  post: PostResponse;
  onPostUpdated?: () => void;
}

export function PostCardWithInteractions({
  post,
  onPostUpdated,
}: PostCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(
    post.liked_by?.includes(user?.id ?? "")
  );
  const [likes, setLikes] = useState(post.likes);
  const [isLoadingLike, setIsLoadingLike] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComment, setIsLoadingComment] = useState(false);

  const handleLike = async () => {
    if (!user?.id) return;

    setIsLoadingLike(true);
    try {
      if (isLiked) {
        await removeLike(post.id, user.id);
        setIsLiked(false);
        setLikes((prev) => Math.max(0, prev - 1));
      } else {
        await likePost(post.id, user.id);
        setIsLiked(true);
        setLikes((prev) => prev + 1);
      }
      onPostUpdated?.();
    } catch (err) {
      console.error("Erro ao curtir post:", err);
    } finally {
      setIsLoadingLike(false);
    }
  };

  const handleAddComment = async () => {
    if (!user?.id || !newComment.trim()) return;

    setIsLoadingComment(true);
    try {
      const payload: CommentCreate = {
        user_id: user.id,
        content: newComment,
      };

      await addComment(post.id, payload);
      setNewComment("");
      onPostUpdated?.();
    } catch (err) {
      console.error("Erro ao comentar:", err);
    } finally {
      setIsLoadingComment(false);
    }
  };

  const handleRemoveComment = async (commentIndex: number) => {
    if (!user?.id) return;

    try {
      await removeComment(post.id, commentIndex, user.id);
      onPostUpdated?.();
    } catch (err) {
      console.error("Erro ao remover comentário:", err);
    }
  };

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      {/* Post content */}
      <p>{post.content}</p>

      {/* Interactions */}
      <div className="mt-4 flex gap-4">
        <button
          onClick={handleLike}
          disabled={isLoadingLike}
          className={`flex items-center gap-2 ${
            isLiked ? "text-red-500" : "text-gray-500"
          }`}
        >
          ❤️ {likes}
        </button>

        <span className="text-gray-500">💬 {post.comments.length}</span>
      </div>

      {/* Comments section */}
      <div className="mt-4 space-y-2 border-t pt-4">
        <h3 className="font-bold">Comentários ({post.comments.length})</h3>

        {post.comments.map((comment, index) => (
          <div key={index} className="flex justify-between rounded bg-gray-50 p-2">
            <div>
              <p className="font-semibold">{comment.user_name}</p>
              <p>{comment.content}</p>
            </div>
            {comment.user_id === user?.id && (
              <button
                onClick={() => handleRemoveComment(index)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        {/* Add comment form */}
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Deixe um comentário..."
            className="flex-1 rounded border px-2 py-1"
          />
          <button
            onClick={handleAddComment}
            disabled={isLoadingComment || !newComment.trim()}
            className="rounded bg-blue-500 px-4 py-1 text-white disabled:opacity-50"
          >
            {isLoadingComment ? "..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
