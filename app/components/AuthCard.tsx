type AuthCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function AuthCard({ children, className = "" }: AuthCardProps) {
  return (
    <section
      className={`w-full rounded-3xl bg-white px-10 py-12 shadow-md transition-shadow duration-200 hover:shadow-lg md:px-12 ${className}`}
    >
      {children}
    </section>
  );
}
