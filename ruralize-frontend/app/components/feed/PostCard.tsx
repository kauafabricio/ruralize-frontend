"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  likePost,
  removeLike,
  addComment,
  removeComment,
  updatePost,
  deletePost,
  type CommentCreate,
  type PostResponse,
} from "@/app/services/api/posts.api";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { Toast } from "@/app/components/Toast";
import { findAppointment, type Appointment } from "@/app/lib/appointments";
import { readCreatedEvent } from "@/app/lib/userEvents";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editAction, setEditAction] = useState(post.sustainable_action);
  const [editLocation, setEditLocation] = useState(post.location ?? "");
  const [editImageUrl, setEditImageUrl] = useState(post.image_url ?? "");
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteSuccessOpen, setDeleteSuccessOpen] = useState(false);
  const [promotedEvent, setPromotedEvent] = useState<Appointment | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const canManagePost = Boolean(user?.id && post.user_id === user.id);

  useEffect(() => {
    if (!post.event_id) {
      setPromotedEvent(null);
      return;
    }

    setPromotedEvent(findAppointment(post.event_id) ?? readCreatedEvent(post.event_id));
  }, [post.event_id]);

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

  async function handleSavePost() {
    if (!editContent.trim()) {
      setToast({
        message: "Digite um conteudo para salvar",
        type: "error",
      });
      return;
    }

    setIsSavingPost(true);
    try {
      await updatePost(post.id, {
        content: editContent.trim(),
        sustainable_action: editAction.trim() || "general",
        location: editLocation.trim() || null,
        image_url: editImageUrl.trim() || null,
      });

      setToast({
        message: "Publicacao atualizada",
        type: "success",
      });
      setIsEditing(false);
      onPostUpdated?.();
    } catch (err) {
      setToast({
        message:
          err instanceof Error ? err.message : "Erro ao atualizar publicacao",
        type: "error",
      });
    } finally {
      setIsSavingPost(false);
    }
  }

  async function handleDeletePost() {
    if (!user?.id) {
      return;
    }

    setIsDeletingPost(true);
    try {
      await deletePost(post.id, user.id);
      setDeleteConfirmationOpen(false);
      setDeleteSuccessOpen(true);
    } catch (err) {
      setToast({
        message:
          err instanceof Error ? err.message : "Erro ao excluir publicacao",
        type: "error",
      });
    } finally {
      setIsDeletingPost(false);
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
      {deleteConfirmationOpen ? (
        <DeleteConfirmationDialog
          isDeleting={isDeletingPost}
          onCancel={() => setDeleteConfirmationOpen(false)}
          onConfirm={handleDeletePost}
        />
      ) : null}
      {deleteSuccessOpen ? (
        <DeleteSuccessDialog
          onClose={() => {
            setDeleteSuccessOpen(false);
            onPostUpdated?.();
          }}
        />
      ) : null}

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

          <div className="flex shrink-0 items-center gap-3">
            {canManagePost ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing((current) => !current)}
                  className="rounded-full px-3 py-1.5 text-[11px] font-black text-[#287630] transition hover:bg-[#f4f5f0]"
                >
                  {isEditing ? "Cancelar" : "Editar"}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmationOpen(true)}
                  disabled={isDeletingPost}
                  className="rounded-full px-3 py-1.5 text-[11px] font-black text-[#b92828] transition hover:bg-[#fff3f3] disabled:opacity-50"
                >
                  {isDeletingPost ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            ) : null}
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8b998d]">
              {formatDate(post.created_at)}
            </span>
          </div>
        </div>

        {isEditing ? (
          <div className="mt-5 space-y-3 rounded-[18px] border border-[#e7eadf] bg-[#fbfcf7] p-4">
            <label className="block text-[11px] font-black uppercase tracking-[0.08em] text-[#687266]">
              Conteudo
              <textarea
                value={editContent}
                onChange={(event) => setEditContent(event.target.value)}
                rows={4}
                className="mt-2 w-full resize-none rounded-[14px] border border-[#e0e5d8] bg-white px-4 py-3 text-sm font-medium normal-case leading-6 tracking-normal text-[#20281f] outline-none focus:border-[#9ac89c]"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-[11px] font-black uppercase tracking-[0.08em] text-[#687266]">
                Categoria
                <select
                  value={editAction}
                  onChange={(event) => setEditAction(event.target.value)}
                  className="mt-2 h-10 w-full rounded-full border border-[#e0e5d8] bg-white px-4 text-[12px] font-semibold normal-case tracking-normal text-[#30372f] outline-none focus:border-[#9ac89c]"
                >
                  <option value="general">Geral</option>
                  <option value="events">Eventos</option>
                  <option value="warnings">Avisos</option>
                  <option value="projects">Projetos</option>
                </select>
              </label>
              <label className="block text-[11px] font-black uppercase tracking-[0.08em] text-[#687266]">
                Local
                <input
                  type="text"
                  value={editLocation}
                  onChange={(event) => setEditLocation(event.target.value)}
                  className="mt-2 h-10 w-full rounded-full border border-[#e0e5d8] bg-white px-4 text-[12px] font-semibold normal-case tracking-normal text-[#30372f] outline-none focus:border-[#9ac89c]"
                  placeholder="Opcional"
                />
              </label>
            </div>
            <label className="block text-[11px] font-black uppercase tracking-[0.08em] text-[#687266]">
              Imagem
              <input
                type="url"
                value={editImageUrl}
                onChange={(event) => setEditImageUrl(event.target.value)}
                className="mt-2 h-10 w-full rounded-full border border-[#e0e5d8] bg-white px-4 text-[12px] font-semibold normal-case tracking-normal text-[#30372f] outline-none focus:border-[#9ac89c]"
                placeholder="https://..."
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditContent(post.content);
                  setEditAction(post.sustainable_action);
                  setEditLocation(post.location ?? "");
                  setEditImageUrl(post.image_url ?? "");
                  setIsEditing(false);
                }}
                className="h-10 rounded-full bg-[#eef0ea] px-5 text-[11px] font-black text-[#4f5b4e]"
              >
                Descartar
              </button>
              <button
                type="button"
                onClick={handleSavePost}
                disabled={isSavingPost || !editContent.trim()}
                className="h-10 rounded-full bg-[#287630] px-5 text-[11px] font-black text-white disabled:opacity-50"
              >
                {isSavingPost ? "Salvando..." : "Salvar alteracoes"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-5 text-sm leading-6 text-[#20281f]">
              {post.content}
            </p>

            {post.location ? (
              <p className="mt-3 text-[12px] font-semibold text-[#687266]">
                {post.location}
              </p>
            ) : null}

            {promotedEvent ? (
              <Link
                href={`/agendamentos/${promotedEvent.slug}`}
                className="mt-4 flex items-center justify-between gap-4 rounded-[16px] border border-[#cfe7c7] bg-[#f4fbf1] px-4 py-4 transition hover:border-[#9ac89c]"
              >
                <span>
                  <span className="block text-[10px] font-black uppercase tracking-[0.1em] text-[#287630]">
                    Evento promovido
                  </span>
                  <span className="mt-1 block text-[13px] font-black text-[#1e261e]">
                    {promotedEvent.title}
                  </span>
                  <span className="block text-[11px] font-semibold text-[#65705f]">
                    {promotedEvent.compactDate}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-[#287630] px-4 py-2 text-[10px] font-black text-white">
                  Participar
                </span>
              </Link>
            ) : null}
          </>
        )}

        {!isEditing && post.image_url && (
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

function DeleteConfirmationDialog({
  isDeleting,
  onCancel,
  onConfirm,
}: {
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f281f]/35 px-4 py-8 backdrop-blur-[4px]">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-post-title"
        className="w-full max-w-[380px] rounded-[24px] bg-white px-7 pb-7 pt-8 text-center shadow-[0_24px_50px_rgba(33,55,30,0.24)]"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff3f3] text-[#b92828]">
          <TrashIcon className="h-6 w-6" />
        </div>
        <h2
          id="delete-post-title"
          className="mt-5 text-[21px] font-black tracking-[-0.04em] text-[#1e261e]"
        >
          Excluir publicacao?
        </h2>
        <p className="mx-auto mt-3 max-w-[280px] text-[12px] font-semibold leading-5 text-[#65705f]">
          Essa publicacao sera removida do feed. Depois de confirmar, nao sera
          possivel recuperar o conteudo.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="h-11 rounded-full bg-[#eef0ea] px-5 text-[11px] font-black text-[#4f5b4e] transition hover:bg-[#e3e7dd] disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-11 rounded-full bg-[#b92828] px-5 text-[11px] font-black text-white shadow-[0_10px_18px_rgba(185,40,40,0.18)] transition hover:bg-[#9f2020] disabled:opacity-60"
          >
            {isDeleting ? "Excluindo..." : "Confirmar"}
          </button>
        </div>
      </section>
    </div>
  );
}

function DeleteSuccessDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f281f]/25 px-4 py-8 backdrop-blur-[4px]">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-success-title"
        className="w-full max-w-[360px] rounded-[24px] bg-white px-7 pb-7 pt-8 text-center shadow-[0_24px_50px_rgba(33,55,30,0.22)]"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e4f5df] text-[#287630]">
          <CheckIcon className="h-6 w-6" />
        </div>
        <h2
          id="delete-success-title"
          className="mt-5 text-[21px] font-black tracking-[-0.04em] text-[#1e261e]"
        >
          Item excluido
        </h2>
        <p className="mx-auto mt-3 max-w-[250px] text-[12px] font-semibold leading-5 text-[#65705f]">
          A publicacao foi excluida com sucesso.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-7 h-11 w-full rounded-full bg-[#287630] px-5 text-[11px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.18)] transition hover:bg-[#1f6428]"
        >
          Entendi
        </button>
      </section>
    </div>
  );
}

function TrashIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 16H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}
