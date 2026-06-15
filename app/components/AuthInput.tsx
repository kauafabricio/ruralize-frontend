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
        <span className="mb-3 block text-[10px] font-black uppercase tracking-[0.14em] text-gray-700">
          {label}
        </span>
      ) : null}

      <span className="flex h-16 items-center gap-4 rounded-2xl border border-pastel-support bg-white px-4 text-gray-500 shadow-sm transition duration-200 focus-within:shadow-md focus-within:border-primary-dark focus-within:ring-1 focus-within:ring-primary-dark-20">
        {icon && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center">
            {icon}
          </span>
        )}

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="h-full min-w-0 flex-1 bg-transparent text-[13px] font-medium text-gray-800 outline-none placeholder:text-gray-500"
        />

        {action ? (
          <span className="flex h-full items-center gap-3">{action}</span>
        ) : null}
      </span>
    </label>
  );
}