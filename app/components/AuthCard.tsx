type AuthCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function AuthCard({ children, className = "" }: AuthCardProps) {
  return (
    <section
      className={`w-full rounded-2xl bg-white border border-pastel-support/20 px-8 py-10 shadow-soft md:px-12 md:py-12 ${className}`}
    >
      {children}
    </section>
  );
}
