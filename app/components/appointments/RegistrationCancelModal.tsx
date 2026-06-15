"use client";

type RegistrationCancelModalProps = {
  onClose: () => void;
  onConfirm: () => void;
};

export function RegistrationCancelModal({
  onClose,
  onConfirm,
}: RegistrationCancelModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <h2 className="text-xl font-black text-neutral-darker">
          Cancelar inscrição?
        </h2>

        <p className="mt-3 text-sm text-[#566052]">
          Tem certeza que deseja cancelar sua inscrição neste evento?
          Você poderá se inscrever novamente depois.
        </p>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-[#d8ddd5] py-3 text-sm font-bold text-[#566052] transition hover:bg-[#f5f5f5]"
          >
            Voltar
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 rounded-full bg-red-600 py-3 text-sm font-bold text-white transition hover:bg-red-700"
          >
            Cancelar inscrição
          </button>
        </div>
      </div>
    </div>
  );
}