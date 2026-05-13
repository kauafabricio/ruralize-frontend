"use client";

import { useEffect, useId, useRef, useState } from "react";

import { ImageIcon } from "./FeedIcons";

export function PostComposer() {
  const fileInputId = useId();
  const textInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setPreviewUrl(null);
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
  }

  function clearImage() {
    setPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <section className="rounded-[28px] bg-white px-6 py-6 shadow-[0_1px_0_rgba(33,55,30,0.04)]">
      <div className="flex items-start gap-4">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#205f36] ring-4 ring-[#edf3e7]">
          <span className="absolute left-[13px] top-[8px] h-[11px] w-[15px] rounded-full bg-[#e7b37f]" />
          <span className="absolute left-[10px] top-[15px] h-[10px] w-[22px] rounded-t-full bg-[#263e2b]" />
          <span className="absolute bottom-0 left-[8px] h-[20px] w-[27px] rounded-t-[16px] bg-[#dfead7]" />
        </div>

        <div className="min-w-0 flex-1">
          <label htmlFor={textInputId} className="sr-only">
            Criar publicação
          </label>
          <textarea
            id={textInputId}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Compartilhe um avanço sustentável ou projeto acadêmico..."
            rows={1}
            className="min-h-11 w-full resize-none rounded-full bg-[#f4f5f0] px-6 py-[14px] text-[13px] font-medium leading-4 text-[#30372f] outline-none placeholder:text-[#a4aaa0]"
          />

          {previewUrl && (
            <div className="mt-4 overflow-hidden rounded-[18px] border border-[#e7e9e1] bg-[#f8f8f3]">
              <div className="relative h-[210px] w-full">
                {/* Object URLs from local file previews cannot be optimized by next/image. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Imagem selecionada para publicação"
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
              aria-disabled="true"
              className="h-9 min-w-[132px] rounded-full bg-[#287630] px-7 text-[11px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.18)]"
            >
              Publicar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
