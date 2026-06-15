"use client";

import { useEffect, useState, useRef } from "react";

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
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const interval = 50;
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => prev - step);
    }, interval);

    const timeoutId = setTimeout(() => {
      clearInterval(timer);
      onCloseRef.current?.();
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(timeoutId);
    };
  }, [duration]);

  return (
    <div className="fixed top-5 left-5 z-50 w-[320px] overflow-hidden rounded-lg shadow-lg border border-gray-200 bg-white">
      <div className="p-4 text-sm font-medium text-gray-900">
        {message}
      </div>

      {/* barra de progresso */}
      <div className="h-1 w-full bg-gray-200">
        <div
          className={`h-full transition-all duration-50 ${
            type === "error" ? "bg-red-500" : "bg-primary-dark"
          }`}
          style={{ width: `${Math.max(0, progress)}%` }}
        />
      </div>
    </div>
  );
}