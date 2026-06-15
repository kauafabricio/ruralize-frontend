import React from "react";

type AuthInputProps = {
  label?: string;
  placeholder: string;
  type?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function AuthInput({
  label,
  placeholder,
  type = "text",
  icon,
  action,
  className = "",
  value,
  onChange,
}: AuthInputProps) {
  return (
    <label className={`block ${className}`}>
      {label ? (
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-primary-dark">
          {label}
        </span>
      ) : null}

      <span className="flex h-14 items-center gap-3 border border-pastel-support rounded-xl px-4 bg-white text-neutral-muted transition-all duration-200 hover:border-pastel-support/60 focus-within:ring-2 focus-within:ring-primary-dark focus-within:border-transparent">
        {icon && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center text-neutral-muted">
            {icon}
          </span>
        )}

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="h-full min-w-0 flex-1 bg-transparent text-sm font-normal text-neutral-darker outline-none placeholder:text-neutral-muted"
        />

        {action ? (
          <span className="flex h-full items-center gap-3">{action}</span>
        ) : null}
      </span>
    </label>
  );
}