"use client";

import { useEffect, useState } from "react";

type ToastProps = {
  message: string;
  type?: "success" | "error";
  duration?: number;
  onClose?: () => void;
};

export function Toast({
  message,
  type = "success",
  duration = 5000,
  onClose,
}: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = 50;
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onClose?.();
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-5 left-5 z-50 w-[320px] overflow-hidden rounded-lg shadow-lg border bg-white">
      <div className="p-4 text-sm font-medium text-[#283022]">
        {message}
      </div>

      {/* barra de progresso */}
      <div className="h-1 w-full bg-gray-200">
        <div
          className={`h-full transition-all ${
            type === "error" ? "bg-red-500" : "bg-green-500"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}