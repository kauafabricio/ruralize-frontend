type AuthInputProps = {
  label: string;
  placeholder: string;
  type?: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

export function AuthInput({
  label,
  placeholder,
  type = "text",
  icon,
  action,
  className = "",
}: AuthInputProps) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.14em] text-[#262b23]">
        {label}
        {action}
      </span>
      <span className="flex h-16 items-center gap-4 bg-[#e2e2df] px-4 text-[#768070]">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
          {icon}
        </span>
        <input
          type={type}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-[13px] font-medium text-[#283022] outline-none placeholder:text-[#93998e]"
        />
      </span>
    </label>
  );
}
