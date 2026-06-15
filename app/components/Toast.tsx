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
    <div className={`fixed top-6 left-6 z-50 w-80 overflow-hidden rounded-2xl border shadow-soft ${
      type === "error"
        ? "bg-danger-light border-danger-primary/30"
        : "bg-success-light border-success-primary/30"
    }`}>
      <div className={`p-4 text-sm font-medium ${
        type === "error" ? "text-danger-primary" : "text-primary-dark"
      }`}>
        {message}
      </div>

      <div className="h-1 w-full bg-neutral-light">
        <div
          className={`h-full transition-all ${
            type === "error" ? "bg-danger-primary" : "bg-primary-dark"
          }`}
          style={{ width: `${Math.max(0, progress)}%` }}
        />
      </div>
    </div>
  );
}