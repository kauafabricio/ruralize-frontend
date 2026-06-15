"use client";

import { useId, useRef, useState } from "react";
import { createPost, type PostCreate } from "@/app/services/api/posts.api";
import { useAuthenticatedUser } from "@/app/components/auth/useAuthenticatedUser";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { Toast } from "@/app/components/Toast";
import { getAllActions } from "@/app/lib/sustainableActions";
import { getEvent, listEvents } from "@/app/services/api/events.api";
import {
  eventToUserCreatedEvent,
  isTeacherUser,
  readEventsByCreator,
  type UserCreatedEvent,
} from "@/app/lib/userEvents";
import { readFileAsDataUrl } from "@/app/lib/fileReader";
import { ImageIcon } from "./FeedIcons";

export function PostComposer({
  onPostCreated,
}: {
  onPostCreated?: () => void;
}) {
  const { userId, isAuthenticated, isReady, error: authError } =
    useAuthenticatedUser();
  const { user } = useAuth();
  const fileInputId = useId();
  const textInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [selectedActionId, setSelectedActionId] = useState("");
  const [location, setLocation] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNewActionModal, setShowNewActionModal] = useState(false);
  const [newActionName, setNewActionName] = useState("");
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [createdEvents, setCreatedEvents] = useState<UserCreatedEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<UserCreatedEvent | null>(
    null,
  );
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedImage(null);
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setSelectedImage(dataUrl);
    } catch (error) {
      console.error("Erro ao ler arquivo de publicação:", error);
      setSelectedImage(null);
    }
  }

  function clearImage() {
    setSelectedImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleCreateNewAction() {
    if (!newActionName.trim()) {
      setToast({
        message: "Digite um nome para a ação",
        type: "error",
      });
      return;
    }

    setSelectedActionId(newActionName.trim());
    setNewActionName("");
    setShowNewActionModal(false);
  }

  async function openPromoteDialog() {
    if (!user?.id) {
      return;
    }

    setPromoteDialogOpen(true);
    setCreatedEvents(readEventsByCreator(user.id));

    try {
      const listedEvents = await listEvents();
      const detailedEvents = await Promise.all(
        listedEvents.map((event) => getEvent(event.id).catch(() => null)),
      );
      setCreatedEvents(
        detailedEvents
          .filter(
            (event): event is NonNullable<typeof event> =>
              Boolean(event && event.promoter_id === user.id),
          )
          .map(eventToUserCreatedEvent),
      );
    } catch {
      setCreatedEvents(readEventsByCreator(user.id));
    }
  }

  function selectEventToPromote(event: UserCreatedEvent) {
    setSelectedEvent(event);
    setSelectedActionId(event.actionId ?? selectedActionId);
    setLocation(event.location);
    setSelectedImage(event.image);
    setText((currentText) =>
      currentText.trim()
        ? currentText
        : `Participe do evento "${event.title}" em ${event.compactDate}. ${event.shortDescription}`,
    );
    setPromoteDialogOpen(false);
  }

  async function handlePublish() {
    console.log("[PostComposer] Iniciando publicação...");
    console.log("[PostComposer] Estado atual:", {
      isReady,
      isAuthenticated,
      userId,
      textLength: text.length,
      authError,
    });

    if (!text.trim() && !selectedEvent) {
      setToast({
        message: "Digite algo para publicar",
        type: "error",
      });
      return;
    }

    if (!isReady && !isAuthenticated) {
      console.warn("[PostComposer] Sistema ainda está carregando");
      setToast({
        message: "Carregando dados de autenticação...",
        type: "error",
      });
      return;
    }

    if (!isAuthenticated || !userId) {
      console.error("[PostComposer] Usuário não autenticado", {
        isAuthenticated,
        userId,
        authError,
      });
      setToast({
        message: authError || "Você precisa estar autenticado para publicar",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const payload: PostCreate = {
        content:
          text.trim() ||
          `Participe do evento "${selectedEvent?.title}" em ${selectedEvent?.compactDate}.`,
        sustainable_action: selectedActionId || undefined,
        location: location.trim() || undefined,
        event_id: selectedEvent?.id,
        image_url: selectedImage || undefined,
      };

      console.log("[PostComposer] Enviando payload:", {
        userId,
        contentLength: payload.content.length,
        hasImage: !!payload.image_url,
      });

      const response = await createPost(userId, payload);

      console.log("[PostComposer] Resposta da API:", response);

      setToast({
        message: "Publicacao criada com sucesso!",
        type: "success",
      });

      setText("");
      setSelectedActionId("");
      setLocation("");
      setSelectedEvent(null);
      clearImage();
      onPostCreated?.();
    } catch (err) {
      console.error("[PostComposer] Erro ao criar postagem:", {
        error: err,
        errorMessage: err instanceof Error ? err.message : String(err),
        errorStack: err instanceof Error ? err.stack : undefined,
      });
      setToast({
        message: err instanceof Error ? err.message : "Erro ao publicar",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  const isDisabled =
    loading || (!text.trim() && !selectedEvent) || (!isAuthenticated && isReady);
  const canPromoteEvents = isTeacherUser(user);

  return (
    <section className="rounded-2xl bg-white px-6 py-6 shadow-soft-xs">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {showNewActionModal && (
        <NewActionModal
          newActionName={newActionName}
          onNameChange={setNewActionName}
          onConfirm={handleCreateNewAction}
          onCancel={() => {
            setShowNewActionModal(false);
            setNewActionName("");
          }}
        />
      )}

      <div className="flex items-start gap-4">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-primary-dark ring-4 ring-[#edf3e7]">
          <span className="absolute left-[13px] top-[8px] h-[11px] w-[15px] rounded-full bg-white" />
          <span className="absolute left-[10px] top-[15px] h-[10px] w-[22px] rounded-t-full bg-white" />
          <span className="absolute bottom-0 left-[8px] h-[20px] w-[27px] rounded-t-[16px] bg-white" />
        </div>

        <div className="min-w-0 flex-1">
          <label htmlFor={textInputId} className="sr-only">
            Criar publicação
          </label>
          <textarea
            id={textInputId}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Compartilhe um avanco sustentavel ou projeto academico..."
            rows={1}
            disabled={!isAuthenticated && isReady}
            className="min-h-11 w-full resize-none rounded-full bg-neutral-light px-6 py-[14px] text-sm font-medium leading-4 text-neutral-darker outline-none placeholder:text-neutral-muted disabled:opacity-50"
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-[160px_1fr]">
            <label className="block text-xs font-bold uppercase tracking-[0.08em] text-neutral-muted">
              Acao Sustentavel
              <div className="mt-2 flex gap-2">
                <select
                  value={selectedActionId}
                  onChange={(event) => setSelectedActionId(event.target.value)}
                  disabled={!isAuthenticated && isReady}
                  className="flex-1 h-10 rounded-full border border-pastel-support bg-white px-4 text-xs font-semibold normal-case tracking-normal text-neutral-darker outline-none focus:border-pastel-support disabled:opacity-50"
                >
                  <option value="">🌍 Sem ação</option>
                  {getAllActions().map((action) => (
                    <option key={action.id} value={action.id}>
                      {action.icon} {action.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewActionModal(true)}
                  disabled={!isAuthenticated && isReady}
                  className="h-10 px-4 rounded-full bg-secondary-light text-primary-dark font-bold text-xs hover:bg-white transition disabled:opacity-50"
                  title="Criar nova acao"
                >
                  ➕
                </button>
              </div>
            </label>
            <label className="block text-xs font-bold uppercase tracking-[0.08em] text-neutral-muted">
              Local
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Opcional"
                disabled={!isAuthenticated && isReady}
                className="mt-2 h-10 w-full rounded-full border border-pastel-support bg-white px-4 text-xs font-semibold normal-case tracking-normal text-neutral-darker outline-none placeholder:text-neutral-muted focus:border-pastel-support disabled:opacity-50"
              />
            </label>
          </div>

          {selectedImage && (
            <div className="mt-4 overflow-hidden rounded-xl border border-neutral-light bg-white">
              <div className="relative h-[210px] w-full">
                {/* User-selected data URLs cannot be optimized by next/image. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedImage}
                  alt="Imagem selecionada para publicação"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  disabled={!isAuthenticated && isReady}
                  className="absolute right-3 top-3 rounded-full bg-white px-3 py-2 text-xs font-bold text-primary-dark shadow-soft disabled:opacity-50"
                >
                  Remover
                </button>
              </div>
            </div>
          )}

          {selectedEvent ? (
            <div className="mt-4 rounded-[16px] border border-danger-primary bg-white px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary-dark">
                    Evento selecionado
                  </p>
                  <p className="mt-1 text-sm font-bold text-neutral-darker">
                    {selectedEvent.title}
                  </p>
                  <p className="text-xs font-semibold text-neutral-muted">
                    {selectedEvent.compactDate}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-full px-3 py-1.5 text-xs font-bold text-neutral-muted transition hover:bg-white"
                >
                  Remover
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-5 flex items-center justify-between">
            <input
              ref={fileInputRef}
              id={fileInputId}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
              disabled={!isAuthenticated && isReady}
            />
            <div className="flex flex-wrap items-center gap-4">
              <label
                htmlFor={fileInputId}
                className={`inline-flex items-center gap-2 text-xs font-semibold ${
                  isAuthenticated || !isReady
                    ? "cursor-pointer text-neutral-darker"
                    : "cursor-not-allowed text-neutral-muted"
                }`}
              >
                <ImageIcon className="h-[17px] w-[17px] text-primary-dark" />
                Foto
              </label>
              {canPromoteEvents ? (
                <button
                  type="button"
                  onClick={openPromoteDialog}
                  disabled={!isAuthenticated && isReady}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-darker disabled:text-neutral-muted"
                >
                  <CalendarIcon className="h-[17px] w-[17px] text-primary-dark" />
                  Promover evento
                </button>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handlePublish}
              disabled={isDisabled}
              className="h-9 min-w-[132px] rounded-full bg-primary-dark px-7 text-xs font-bold text-white shadow-soft-sm transition-opacity disabled:opacity-50"
            >
              {loading ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </div>
      </div>
      {promoteDialogOpen ? (
        <PromoteEventDialog
          events={createdEvents}
          onSelect={selectEventToPromote}
          onClose={() => setPromoteDialogOpen(false)}
        />
      ) : null}
    </section>
  );
}

function PromoteEventDialog({
  events,
  onSelect,
  onClose,
}: {
  events: UserCreatedEvent[];
  onSelect: (event: UserCreatedEvent) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-darker/35 px-4 py-8 backdrop-blur-[4px]">
      <section className="mx-auto w-full max-w-[620px] rounded-xl bg-white px-6 py-7 shadow-soft-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-dark">
              Promover evento
            </p>
            <h2 className="mt-2 text-[24px] font-bold tracking-[-0.04em] text-primary-dark">
              Eventos criados por voce
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-2 text-xs font-bold text-neutral-muted transition hover:bg-neutral-light"
          >
            Fechar
          </button>
        </div>
        {events.length > 0 ? (
          <div className="mt-6 space-y-3">
            {events.map((event) => (
              <button
                key={event.slug}
                type="button"
                onClick={() => onSelect(event)}
                className="w-full rounded-[16px] border border-neutral-light px-4 py-4 text-left transition hover:border-pastel-support hover:bg-white"
              >
                <span className="block text-sm font-bold text-neutral-darker">
                  {event.title}
                </span>
                <span className="mt-1 block text-xs font-semibold text-neutral-muted">
                  {event.compactDate} - {event.location}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-[16px] border border-dashed border-pastel-support px-5 py-8 text-center text-xs font-semibold text-neutral-muted">
            Voce ainda nao criou eventos para promover.
          </p>
        )}
      </section>
    </div>
  );
}

function NewActionModal({
  newActionName,
  onNameChange,
  onConfirm,
  onCancel,
}: {
  newActionName: string;
  onNameChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-darker/35 px-4 py-8 backdrop-blur-[4px]">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-action-title"
        className="w-full max-w-[380px] rounded-2xl bg-white px-7 pb-7 pt-8 shadow-soft-lg"
      >
        <h2
          id="new-action-title"
          className="text-[21px] font-bold tracking-[-0.04em] text-neutral-darker"
        >
          Nova Acao
        </h2>
        <p className="mt-3 text-xs font-semibold text-neutral-muted">
          Digite o nome da acao sustentavel que voce deseja criar
        </p>

        <input
          type="text"
          value={newActionName}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              onConfirm();
            }
          }}
          placeholder="Ex: Limpeza de praia"
          autoFocus
          className="mt-5 w-full h-10 rounded-full border border-pastel-support bg-white px-4 text-xs font-semibold text-neutral-darker outline-none focus:border-pastel-support"
        />

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-full bg-white px-5 text-xs font-bold text-neutral-muted transition hover:bg-neutral-light"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!newActionName.trim()}
            className="h-11 rounded-full bg-primary-dark px-5 text-xs font-bold text-white shadow-soft-sm transition hover:bg-primary-darker disabled:opacity-50"
          >
            Criar
          </button>
        </div>
      </section>
    </div>
  );
}

function CalendarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

