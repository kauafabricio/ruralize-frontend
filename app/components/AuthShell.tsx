import { AuthLogo } from "./AuthLogo";

type AuthShellProps = {
  children: React.ReactNode;
  logoName?: string;
};

export function AuthShell({ children, logoName }: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-white text-neutral-darker">
      <div className="absolute inset-y-0 left-0 w-[38%] bg-[radial-gradient(circle_at_32%_28%,rgba(176,205,186,0.15),transparent_36%)]" />
      <div className="absolute inset-y-0 right-0 w-[38%] bg-[radial-gradient(circle_at_72%_58%,rgba(245,238,224,0.2),transparent_38%)]" />
      <div
        aria-hidden="true"
        className="absolute -left-20 bottom-28 h-28 w-56 rounded-r-[18px] border-[28px] border-l-0 border-pastel-support/30 opacity-40"
      />
      <div
        aria-hidden="true"
        className="absolute -left-3 bottom-[44%] h-28 w-28 rounded-bl-[90px] rounded-tr-[90px] bg-pastel-support/20 opacity-40"
      />
      <div
        aria-hidden="true"
        className="absolute -right-8 top-[31%] h-52 w-52 rotate-45 border-[28px] border-pastel-support/20 opacity-30"
      />
      <div
        aria-hidden="true"
        className="absolute -right-11 top-[46%] h-28 w-16 bg-secondary-light/40 opacity-30"
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1180px] flex-col px-8 py-10 md:px-16 lg:px-20">
        <AuthLogo name={logoName} />
        <div className="flex flex-1 items-center justify-center py-8">
          {children}
        </div>
      </div>
    </main>
  );
}
