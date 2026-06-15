type AuthCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function AuthCard({ children, className = "" }: AuthCardProps) {
  return (
    <section
      className={`w-full rounded-3xl bg-white px-10 py-12 shadow-[0_26px_60px_rgba(33,55,30,0.11)] md:px-12 ${className}`}
    >
      {children}
    </section>
  );
}
