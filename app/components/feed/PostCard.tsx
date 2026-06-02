"use client";

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
import { Toast } from "@/app/components/Toast";

interface PostCardProps {
  post: PostResponse;
  onPostUpdated?: () => void;
}

export function PostCard({ post, onPostUpdated }: PostCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(
    post.liked_by?.some(
      (like) =>
        typeof like === "string" ? like === user?.id : like.user_id === user?.id
    ) ?? false
  );
  const [likes, setLikes] = useState(post.likes);
  const [isLoadingLike, setIsLoadingLike] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComment, setIsLoadingComment] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "agora";
    if (diffMins < 60) return `há ${diffMins}m`;
    if (diffHours < 24) return `há ${diffHours}h`;
    if (diffDays === 1) return "ontem";
    if (diffDays < 7) return `há ${diffDays}d`;
    return date.toLocaleDateString("pt-BR");
  };

  async function handleLike() {
    if (!user?.id) {
      setToast({
        message: "Faça login para curtir",
        type: "error",
      });
      return;
    }

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
    } catch (err) {
      setToast({
        message:
          err instanceof Error ? err.message : "Erro ao curtir post",
        type: "error",
      });
    } finally {
      setIsLoadingLike(false);
    }
  }

  async function handleAddComment() {
    if (!user?.id) {
      setToast({
        message: "Faça login para comentar",
        type: "error",
      });
      return;
    }

    if (!newComment.trim()) {
      setToast({
        message: "Digite um comentário",
        type: "error",
      });
      return;
    }

    setIsLoadingComment(true);
    try {
      const payload: CommentCreate = {
        user_id: user.id,
        content: newComment,
      };

      await addComment(post.id, payload);

      setToast({
        message: "Comentário adicionado!",
        type: "success",
      });

      setComments([
        ...comments,
        {
          user_id: user.id,
          content: newComment,
          created_at: new Date().toISOString(),
          user_name: user.name || "Você",
        },
      ]);

      setNewComment("");
      setShowCommentForm(false);
      onPostUpdated?.();
    } catch (err) {
      setToast({
        message:
          err instanceof Error ? err.message : "Erro ao comentar",
        type: "error",
      });
    } finally {
      setIsLoadingComment(false);
    }
  }

  async function handleRemoveComment(commentIndex: number) {
    if (!user?.id) return;

    try {
      await removeComment(post.id, commentIndex, user.id);

      setToast({
        message: "Comentário removido",
        type: "success",
      });

      setComments(comments.filter((_, idx) => idx !== commentIndex));
      onPostUpdated?.();
    } catch (err) {
      setToast({
        message:
          err instanceof Error ? err.message : "Erro ao remover comentário",
        type: "error",
      });
    }
  }

  return (
    <article className="overflow-hidden rounded-[28px] bg-white shadow-[0_1px_0_rgba(33,55,30,0.04)]">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="px-6 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#205f36] text-[12px] font-black uppercase text-white">
              {post.user_id.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-black text-[#1f6f2a]">
                {post.user_id}
              </p>
              <p className="text-[12px] text-[#6c7b6d]">
                {post.sustainable_action}
              </p>
            </div>
          </div>

          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8b998d]">
            {formatDate(post.created_at)}
          </span>
        </div>

        <p className="mt-5 text-sm leading-6 text-[#20281f]">{post.content}</p>

        {post.image_url && (
          <div className="mt-4 overflow-hidden rounded-[14px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image_url}
              alt="Post image"
              className="h-auto w-full"
            />
          </div>
        )}
      </div>

      <div className="border-t border-[#eff1eb] px-6 py-4">
        <div className="mb-4 flex items-center justify-between text-[12px] text-[#4f5b4e]">
          <span className="font-semibold">{likes} curtida{likes !== 1 ? "s" : ""}</span>
          <span>{comments.length} comentário{comments.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="flex gap-4 border-t border-[#eff1eb] pt-3">
          <button
            onClick={handleLike}
            disabled={isLoadingLike}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-[12px] font-semibold transition-all ${
              isLiked
                ? "bg-[#fde8e8] text-[#c63a3a]"
                : "hover:bg-[#f4f5f0] text-[#4f5b4e]"
            } disabled:opacity-50`}
          >
            <span className={isLiked ? "text-lg" : "text-lg opacity-60"}>
              {isLiked ? "❤️" : "🤍"}
            </span>
            {isLoadingLike ? "..." : "Curtir"}
          </button>

          <button
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-[12px] font-semibold text-[#4f5b4e] transition-all hover:bg-[#f4f5f0]"
          >
            <span className="text-lg opacity-60">💬</span>
            Comentar
          </button>
        </div>

        {comments.length > 0 && (
          <div className="mt-4 space-y-3 border-t border-[#eff1eb] pt-4">
            {comments.map((comment, index) => (
              <div
                key={index}
                className="rounded-lg bg-[#f4f5f0] px-4 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-[12px] font-black text-[#1f6f2a]">
                      {comment.user_name}
                    </p>
                    <p className="mt-1 text-[12px] text-[#20281f]">
                      {comment.content}
                    </p>
                    {comment.created_at && (
                      <p className="mt-1 text-[11px] text-[#8b998d]">
                        {formatDate(comment.created_at)}
                      </p>
                    )}
                  </div>
                  {comment.user_id === user?.id && (
                    <button
                      onClick={() => handleRemoveComment(index)}
                      className="text-[12px] font-semibold text-red-600 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showCommentForm && (
          <div className="mt-4 flex gap-2 border-t border-[#eff1eb] pt-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !isLoadingComment) {
                  handleAddComment();
                }
              }}
              placeholder="Deixe um comentário..."
              className="flex-1 rounded-full bg-[#f4f5f0] px-4 py-2 text-[12px] outline-none placeholder:text-[#a4aaa0]"
            />
            <button
              onClick={handleAddComment}
              disabled={isLoadingComment || !newComment.trim()}
              className="rounded-full bg-[#287630] px-4 py-2 text-[11px] font-black text-white disabled:opacity-50 transition-opacity"
            >
              {isLoadingComment ? "..." : "Enviar"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
