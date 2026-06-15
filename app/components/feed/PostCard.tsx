"use client";

import Link from "next/link";
import { useState, useRef, type ChangeEvent } from "react";
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
import {
  getActionIcon,
  getActionName,
  getAllActions,
} from "@/app/lib/sustainableActions";
import { readFileAsDataUrl } from "@/app/lib/fileReader";

interface PostCardProps {
  post: PostResponse;
  onPostUpdated?: () => void;
}

export function PostCard({ post, onPostUpdated }: PostCardProps) {
  const { user } = useAuth();
  const authorName =
    post.user_name ||
    (post.user_id === user?.id ? user.name || "Você" : "Usuário");
  const authorPhotoUrl =
    post.user_photo ||
    (post.user_id === user?.id ? user.avatarUrl || null : null);
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
  const [editActionId, setEditActionId] = useState(
    post.sustainable_action_id || post.sustainable_action || ""
  );
  const [editLocation, setEditLocation] = useState(post.location ?? "");
  const [editImageUrl, setEditImageUrl] = useState(post.image_url ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteSuccessOpen, setDeleteSuccessOpen] = useState(false);
  const [commentDeletionIndex, setCommentDeletionIndex] = useState<number | null>(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const canManagePost = Boolean(user?.id && post.user_id === user.id);

  async function handleEditImageFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setEditImageUrl(post.image_url ?? "");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setEditImageUrl(dataUrl);
    } catch {
      setToast({
        message: "Não foi possível carregar a imagem.",
        type: "error",
      });
    }
  }

  function clearEditImage() {
    setEditImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

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
          user_photo: user.avatarUrl || null,
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
    setCommentDeletionIndex(commentIndex);
  }

  async function confirmRemoveComment() {
    if (commentDeletionIndex === null || !user?.id) {
      return;
    }

    setIsDeletingComment(true);
    try {
      await removeComment(post.id, commentDeletionIndex, user.id);

      setToast({
        message: "Comentário removido",
        type: "success",
      });

      setComments((prevComments) =>
        prevComments.filter((_, idx) => idx !== commentDeletionIndex),
      );
      setCommentDeletionIndex(null);
      onPostUpdated?.();
    } catch (err) {
      setToast({
        message:
          err instanceof Error ? err.message : "Erro ao remover comentário",
        type: "error",
      });
    } finally {
      setIsDeletingComment(false);
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
        sustainable_action: editActionId || undefined,
        location: editLocation.trim() || null,
        image_url: editImageUrl.trim() || null,
      });

      setToast({
        message: "Publicação atualizada",
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
          err instanceof Error ? err.message : "Erro ao excluir publicação",
        type: "error",
      });
    } finally {
      setIsDeletingPost(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-md transition-shadow duration-200 hover:shadow-lg">
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
          <Link
            href={`/perfil/${post.user_id}`}
            className="group flex items-center gap-4 rounded-2xl pr-2 transition duration-150 hover:bg-gray-50"
            aria-label={`Abrir perfil de ${authorName}`}
          >
            {authorPhotoUrl ? (
              <img
                src={authorPhotoUrl}
                alt={authorName}
                className="h-11 w-11 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-dark text-[12px] font-black uppercase text-white">
                {readInitials(authorName)}
              </div>
            )}
            <div>
              <p className="text-sm font-black text-primary-dark transition duration-150 group-hover:text-primary-dark/80">
                {authorName}
              </p>
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5">
                <span className="text-[14px]">
                  {getActionIcon(post.sustainable_action_id || post.sustainable_action || "")}
                </span>
                <span className="text-[12px] font-semibold text-primary-dark">
                  {getActionName(post.sustainable_action_id || post.sustainable_action || "")}
                </span>
              </div>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-3">
            {canManagePost ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing((current) => !current)}
                  className="rounded-full px-3 py-1.5 text-[11px] font-black text-primary-dark transition duration-150 hover:bg-gray-100"
                >
                  {isEditing ? "Cancelar" : "Editar"}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmationOpen(true)}
                  disabled={isDeletingPost}
                  className="rounded-full px-3 py-1.5 text-[11px] font-black text-red-600 transition duration-150 hover:bg-red-50 disabled:opacity-50"
                >
                  {isDeletingPost ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            ) : null}
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-500">
              {formatDate(post.created_at)}
            </span>
          </div>
        </div>

        {isEditing ? (
          <div className="mt-5 space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <label className="block text-[11px] font-black uppercase tracking-[0.08em] text-gray-600">
              Conteudo
              <textarea
                value={editContent}
                onChange={(event) => setEditContent(event.target.value)}
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium normal-case leading-6 tracking-normal text-gray-900 outline-none transition duration-200 focus:border-primary-dark focus:ring-1 focus:ring-primary-dark/10"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-[11px] font-black uppercase tracking-[0.08em] text-gray-600">
                Acao Sustentavel
                <select
                  value={editActionId}
                  onChange={(event) => setEditActionId(event.target.value)}
                  className="mt-2 h-10 w-full rounded-full border border-gray-200 bg-white px-4 text-[12px] font-semibold normal-case tracking-normal text-gray-900 outline-none transition duration-200 focus:border-primary-dark focus:ring-1 focus:ring-primary-dark/10"
                >
                  <option value="">🌍 Sem ação</option>
                  {getAllActions().map((action) => (
                    <option key={action.id} value={action.id}>
                      {action.icon} {action.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[11px] font-black uppercase tracking-[0.08em] text-gray-600">
                Local
                <input
                  type="text"
                  value={editLocation}
                  onChange={(event) => setEditLocation(event.target.value)}
                  className="mt-2 h-10 w-full rounded-full border border-gray-200 bg-white px-4 text-[12px] font-semibold normal-case tracking-normal text-gray-900 outline-none transition duration-200 focus:border-primary-dark focus:ring-1 focus:ring-primary-dark/10"
                  placeholder="Opcional"
                />
              </label>
            </div>
            <label className="block text-[11px] font-black uppercase tracking-[0.08em] text-gray-600">
              Imagem
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleEditImageFile}
                className="mt-2 w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-[12px] font-semibold normal-case tracking-normal text-gray-900 outline-none transition duration-200 file:mr-4 file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-[12px] file:font-semibold file:text-primary-dark focus:border-primary-dark focus:ring-1 focus:ring-primary-dark/10"
              />
            </label>
            {editImageUrl ? (
              <div className="mt-3 rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={editImageUrl}
                  alt="Preview da imagem do post"
                  className="h-auto w-full"
                />
                <button
                  type="button"
                  onClick={clearEditImage}
                  className="w-full rounded-b-xl bg-red-50 px-4 py-3 text-[11px] font-black text-red-600 transition duration-150 hover:bg-red-100"
                >
                  Remover imagem
                </button>
              </div>
            ) : null}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditContent(post.content);
                  setEditActionId(post.sustainable_action_id || post.sustainable_action || "");
                  setEditLocation(post.location ?? "");
                  setEditImageUrl(post.image_url ?? "");
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                  setIsEditing(false);
                }}
                className="h-10 rounded-full bg-gray-100 px-5 text-[11px] font-black text-gray-700 transition duration-150 hover:bg-gray-200"
              >
                Descartar
              </button>
              <button
                type="button"
                onClick={handleSavePost}
                disabled={isSavingPost || !editContent.trim()}
                className="h-10 rounded-full bg-primary-dark px-5 text-[11px] font-black text-white transition duration-150 hover:bg-primary-dark/90 disabled:opacity-50"
              >
                {isSavingPost ? "Salvando..." : "Salvar alteracoes"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-5 text-sm leading-6 text-gray-900">
              {post.content}
            </p>

            {post.location ? (
              <p className="mt-3 text-[12px] font-semibold text-gray-600">
                {post.location}
              </p>
            ) : null}
          </>
        )}

        {!isEditing && post.image_url && (
          <div className="mt-4 overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image_url}
              alt="Post image"
              className="h-auto w-full"
            />
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 px-6 py-4">
        <div className="mb-4 flex items-center justify-between text-[12px] text-gray-700">
          <span className="font-semibold">{likes} curtida{likes !== 1 ? "s" : ""}</span>
          <span>{comments.length} comentário{comments.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="flex gap-4 border-t border-gray-100 pt-3">
          <button
            onClick={handleLike}
            disabled={isLoadingLike}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-[12px] font-semibold transition-all duration-150 ${
              isLiked
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "hover:bg-gray-50 text-gray-700"
            } disabled:opacity-50`}
          >
            <span className={isLiked ? "text-lg" : "text-lg opacity-60"}>
              {isLiked ? "❤️" : "🤍"}
            </span>
            {isLoadingLike ? "..." : "Curtir"}
          </button>

          <button
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-[12px] font-semibold text-gray-700 transition-all duration-150 hover:bg-gray-50"
          >
            <span className="text-lg opacity-60">💬</span>
            Comentar
          </button>
        </div>

        {comments.length > 0 && (
          <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
            {comments.map((comment, index) => (
              <div
                key={index}
                className="rounded-lg bg-gray-50 px-4 py-3 transition duration-150"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                  {(() => {
                    const commenterName =
                      comment.user_name ||
                      (comment.user_id === user?.id
                        ? user.name || "Você"
                        : "Usuário");
                    const commenterPhoto =
                      comment.user_photo ||
                      (comment.user_id === user?.id ? user.avatarUrl || null : null);
                    return commenterPhoto ? (
                      <img
                        src={commenterPhoto}
                        alt={commenterName}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-dark text-[10px] font-black uppercase text-white">
                        {readInitials(commenterName)}
                      </div>
                    );
                  })()}
                  <div className="flex-1">
                    <Link
                      href={`/perfil/${comment.user_id}`}
                      className="text-[12px] font-black text-primary-dark transition duration-150 hover:text-primary-dark/80"
                    >
                      {comment.user_name || (comment.user_id === user?.id ? user.name || "Você" : "Usuário")}
                    </Link>
                    <p className="mt-1 text-[12px] text-gray-900">
                      {comment.content}
                    </p>
                    {comment.created_at && (
                      <p className="mt-1 text-[11px] text-gray-600">
                        {formatDate(comment.created_at)}
                      </p>
                    )}
                  </div>
                </div>
                  {comment.user_id === user?.id && (
                    <button
                      onClick={() => handleRemoveComment(index)}
                      className="text-[12px] font-semibold text-red-600 transition duration-150 hover:text-red-700"
                    >
                      Excluir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showCommentForm && (
          <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
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
              className="flex-1 rounded-full bg-gray-50 px-4 py-2 text-[12px] outline-none transition duration-150 placeholder:text-gray-500 focus:bg-white focus:ring-1 focus:ring-primary-dark/10"
            />
            <button
              onClick={handleAddComment}
              disabled={isLoadingComment || !newComment.trim()}
              className="rounded-full bg-primary-dark px-4 py-2 text-[11px] font-black text-white transition duration-150 hover:bg-primary-dark/90 disabled:opacity-50"
            >
              {isLoadingComment ? "..." : "Enviar"}
            </button>
          </div>
        )}
      </div>
      {commentDeletionIndex !== null ? (
        <CommentDeleteConfirmationDialog
          isDeleting={isDeletingComment}
          onCancel={() => setCommentDeletionIndex(null)}
          onConfirm={confirmRemoveComment}
        />
      ) : null}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/35 px-4 py-8 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-post-title"
        className="w-full max-w-[380px] rounded-2xl bg-white px-7 pb-7 pt-8 text-center shadow-xl"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <TrashIcon className="h-6 w-6" />
        </div>
        <h2
          id="delete-post-title"
          className="mt-5 text-[21px] font-black tracking-[-0.04em] text-gray-900"
        >
          Excluir publicacao?
        </h2>
        <p className="mx-auto mt-3 max-w-[280px] text-[12px] font-semibold leading-5 text-gray-600">
          Essa publicacao sera removida do feed. Depois de confirmar, nao sera
          possivel recuperar o conteudo.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="h-11 rounded-full bg-gray-100 px-5 text-[11px] font-black text-gray-700 transition duration-150 hover:bg-gray-200 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-11 rounded-full bg-red-600 px-5 text-[11px] font-black text-white shadow-lg transition duration-150 hover:bg-red-700 disabled:opacity-60"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/25 px-4 py-8 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-success-title"
        className="w-full max-w-[360px] rounded-2xl bg-white px-7 pb-7 pt-8 text-center shadow-xl"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-primary-dark">
          <CheckIcon className="h-6 w-6" />
        </div>
        <h2
          id="delete-success-title"
          className="mt-5 text-[21px] font-black tracking-[-0.04em] text-gray-900"
        >
          Item excluido
        </h2>
        <p className="mx-auto mt-3 max-w-[250px] text-[12px] font-semibold leading-5 text-gray-600">
          A publicação foi excluida com sucesso.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-7 h-11 w-full rounded-full bg-primary-dark px-5 text-[11px] font-black text-white shadow-lg transition duration-150 hover:bg-primary-dark/90"
        >
          Entendi
        </button>
      </section>
    </div>
  );
}

function CommentDeleteConfirmationDialog({
  isDeleting,
  onCancel,
  onConfirm,
}: {
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/35 px-4 py-8 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-comment-title"
        className="w-full max-w-[380px] rounded-2xl bg-white px-7 pb-7 pt-8 text-center shadow-xl"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <TrashIcon className="h-6 w-6" />
        </div>
        <h2
          id="delete-comment-title"
          className="mt-5 text-[21px] font-black tracking-[-0.04em] text-gray-900"
        >
          Excluir comentário?
        </h2>
        <p className="mx-auto mt-3 max-w-[280px] text-[12px] font-semibold leading-5 text-gray-600">
          Tem certeza que deseja excluir este comentário? Essa ação não pode ser desfeita.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="h-11 rounded-full bg-gray-100 px-5 text-[11px] font-black text-gray-700 transition duration-150 hover:bg-gray-200 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-11 rounded-full bg-red-600 px-5 text-[11px] font-black text-white shadow-lg transition duration-150 hover:bg-red-700 disabled:opacity-60"
          >
            {isDeleting ? "Excluindo..." : "Confirmar"}
          </button>
        </div>
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

function readInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "R"
  );
}
