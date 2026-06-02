"use client";

import { useId, useRef, useState } from "react";
import { createPost, type PostCreate } from "@/app/services/api/posts.api";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { Toast } from "@/app/components/Toast";

import { ImageIcon } from "./FeedIcons";

export function PostComposer({
  onPostCreated,
}: {
  onPostCreated?: () => void;
}) {
  const { user } = useAuth();
  const fileInputId = useId();
  const textInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [sustainableAction, setSustainableAction] = useState("general");
  const [location, setLocation] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedImage(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(
        typeof reader.result === "string" ? reader.result : null,
      );
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setSelectedImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handlePublish() {
    if (!text.trim()) {
      setToast({
        message: "Digite algo para publicar",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const payload: PostCreate = {
        content: text.trim(),
        sustainable_action: sustainableAction,
        location: location.trim() || undefined,
        image_url: selectedImage || undefined,
      };

      await createPost(user!.id, payload);

      setToast({
        message: "Publicacao criada com sucesso!",
        type: "success",
      });

      setText("");
      setSustainableAction("general");
      setLocation("");
      clearImage();
      onPostCreated?.();
    } catch (err) {
      console.error("Erro ao criar postagem:", err);
      setToast({
        message: err instanceof Error ? err.message : "Erro ao publicar",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[28px] bg-white px-6 py-6 shadow-[0_1px_0_rgba(33,55,30,0.04)]">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex items-start gap-4">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#205f36] ring-4 ring-[#edf3e7]">
          <span className="absolute left-[13px] top-[8px] h-[11px] w-[15px] rounded-full bg-[#e7b37f]" />
          <span className="absolute left-[10px] top-[15px] h-[10px] w-[22px] rounded-t-full bg-[#263e2b]" />
          <span className="absolute bottom-0 left-[8px] h-[20px] w-[27px] rounded-t-[16px] bg-[#dfead7]" />
        </div>

        <div className="min-w-0 flex-1">
          <label htmlFor={textInputId} className="sr-only">
            Criar publicacao
          </label>
          <textarea
            id={textInputId}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Compartilhe um avanco sustentavel ou projeto academico..."
            rows={1}
            className="min-h-11 w-full resize-none rounded-full bg-[#f4f5f0] px-6 py-[14px] text-[13px] font-medium leading-4 text-[#30372f] outline-none placeholder:text-[#a4aaa0]"
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-[160px_1fr]">
            <label className="block text-[11px] font-black uppercase tracking-[0.08em] text-[#687266]">
              Categoria
              <select
                value={sustainableAction}
                onChange={(event) => setSustainableAction(event.target.value)}
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
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Opcional"
                className="mt-2 h-10 w-full rounded-full border border-[#e0e5d8] bg-white px-4 text-[12px] font-semibold normal-case tracking-normal text-[#30372f] outline-none placeholder:text-[#a4aaa0] focus:border-[#9ac89c]"
              />
            </label>
          </div>

          {selectedImage && (
            <div className="mt-4 overflow-hidden rounded-[18px] border border-[#e7e9e1] bg-[#f8f8f3]">
              <div className="relative h-[210px] w-full">
                {/* User-selected data URLs cannot be optimized by next/image. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedImage}
                  alt="Imagem selecionada para publicacao"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute right-3 top-3 rounded-full bg-white px-3 py-2 text-[11px] font-black text-[#287630] shadow-[0_8px_18px_rgba(33,55,30,0.16)]"
                >
                  Remover
                </button>
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between">
            <input
              ref={fileInputRef}
              id={fileInputId}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
            />
            <label
              htmlFor={fileInputId}
              className="inline-flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-[#26372a]"
            >
              <ImageIcon className="h-[17px] w-[17px] text-[#287630]" />
              Foto
            </label>

            <button
              type="button"
              onClick={handlePublish}
              disabled={loading || !text.trim()}
              className="h-9 min-w-[132px] rounded-full bg-[#287630] px-7 text-[11px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.18)] transition-opacity disabled:opacity-50"
            >
              {loading ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
