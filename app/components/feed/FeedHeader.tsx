"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "../auth/AuthProvider";
import { BellIcon } from "./FeedIcons";

const navItems = [
  { label: "Feed", path: "/feed" },
  { label: "Agendamentos", path: "/agendamentos" },
  { label: "Pontos", path: "/pontos" },
  { label: "Perfil", path: "/perfil" },
] as const;

type HeaderSection = (typeof navItems)[number]["label"];

export function FeedHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const navRef = useRef<HTMLElement>(null);
  const buttonRefs = useRef<Record<HeaderSection, HTMLButtonElement | null>>({
    Feed: null,
    Agendamentos: null,
    Pontos: null,
    Perfil: null,
  });
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    opacity: 0,
  });
  const currentSection = useMemo<HeaderSection>(() => {
    const matchedItem = navItems.find((item) => pathname.startsWith(item.path));
    return matchedItem?.label ?? "Feed";
  }, [pathname]);
  const [selectedSection, setSelectedSection] =
    useState<HeaderSection>(currentSection);
  const activeSection = currentSection === "Feed" ? selectedSection : currentSection;

  useEffect(() => {
    const activeButton = buttonRefs.current[activeSection];

    if (!activeButton) {
      return;
    }

    setIndicatorStyle({
      left: activeButton.offsetLeft + activeButton.offsetWidth / 2 - 16,
      opacity: 1,
    });
  }, [activeSection]);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="h-[72px] border-b border-[#eceee8] bg-[#fbfbf7]">
      <div className="mx-auto flex h-full max-w-[1220px] items-center justify-between px-7">
        <Link
          href="/feed"
          className="text-[16px] font-black leading-none tracking-[-0.03em] text-[#1f6f2a]"
          aria-label="Ruralize"
        >
          Ruralize
        </Link>

        <nav
          ref={navRef}
          className="relative ml-[110px] flex h-full items-center gap-10 text-[11px] font-semibold text-[#222a20]"
        >
          <span
            className="absolute top-[45px] h-[3px] w-8 rounded-full bg-[#287630] transition-[left,opacity] duration-300 ease-out"
            style={{
              left: indicatorStyle.left,
              opacity: indicatorStyle.opacity,
            }}
            aria-hidden="true"
          />

          {navItems.map((item) => {
            const active = item.label === activeSection;

            return (
              <button
                key={item.label}
                ref={(element) => {
                  buttonRefs.current[item.label] = element;
                }}
                type="button"
                onClick={() => setSelectedSection(item.label)}
                className={`relative h-full px-1 pt-1 transition-colors duration-300 ${
                  active ? "font-black text-[#1f6f2a]" : "hover:text-[#1f6f2a]"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-6 text-[#101510]">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#f0f2ea]"
            aria-label="Notificações"
          >
            <BellIcon className="h-[18px] w-[18px]" />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="relative h-10 w-10 overflow-hidden rounded-full bg-[#225f35] ring-2 ring-[#e8efdf]"
            aria-label="Sair"
            title="Sair"
          >
            <span className="absolute inset-x-[9px] top-[7px] h-[10px] rounded-full bg-[#f0b07b]" />
            <span className="absolute left-[11px] top-[14px] h-[8px] w-[18px] rounded-t-full bg-[#273f2a]" />
            <span className="absolute bottom-0 left-[7px] h-[19px] w-[26px] rounded-t-[16px] bg-[#e2ead8]" />
            <span className="absolute bottom-[2px] left-[13px] h-[11px] w-[14px] rounded-t-full bg-[#29713b]" />
          </button>
        </div>
      </div>
    </header>
  );
}
