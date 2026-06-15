"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/app/components/auth/AuthProvider";
import { BellIcon, SearchIcon } from "./FeedIcons";

const navItems = [
  { label: "Feed", path: "/feed" },
  { label: "Agendamentos", path: "/agendamentos" },
  { label: "Explorar", path: "/explore" },
  { label: "Pontos", path: "/pontos" },
] as const;

type HeaderSection = (typeof navItems)[number]["label"];

type FeedHeaderProps = {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
};

export function FeedHeader(props: FeedHeaderProps = {}) {
  const {
    searchTerm = "",
    onSearchChange = () => {},
    showSearch = true,
  } = props;
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const navRef = useRef<HTMLElement>(null);
  const buttonRefs = useRef<Record<HeaderSection, HTMLElement | null>>({
    Feed: null,
    Agendamentos: null,
    Explorar: null,
    Pontos: null,
  });
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    opacity: 1,
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const profileAvatarUrl = user?.avatarUrl;
  const menuRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-pastel-support/20 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <Link
          href="/feed"
          className="text-lg font-bold leading-none tracking-tight text-primary-dark"
          aria-label="Ruralize"
        >
          Ruralize
        </Link>

        <nav
          ref={navRef}
          className="relative ml-16 flex h-full items-center gap-8 text-xs font-semibold text-neutral-muted"
        >
          <span
            className="absolute bottom-0 h-[3px] w-8 rounded-full bg-primary-dark transition-[left,opacity] duration-300 ease-out"
            style={{
              left: indicatorStyle.left,
              opacity: indicatorStyle.opacity,
            }}
            aria-hidden="true"
          />

          {navItems.map((item) => {
            const active = item.label === activeSection;
            const itemClassName = `relative flex h-full items-center whitespace-nowrap px-1 pt-1 transition-colors duration-300 ${
              active ? "font-bold text-primary-dark" : "hover:text-primary-dark"
            }`;

            return (
              <Link
                key={item.label}
                ref={(element) => {
                  buttonRefs.current[item.label] = element;
                }}
                href={item.path}
                onClick={() => setSelectedSection(item.label)}
                className={itemClassName}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 text-primary-dark">
          {showSearch ? (
            <div className="flex h-9 w-28 items-center gap-2 rounded-xl border border-pastel-support/40 bg-white px-3 text-primary-dark shadow-soft-xs transition-all hover:border-pastel-support/60 focus-within:ring-2 focus-within:ring-primary-dark focus-within:border-transparent">
              <SearchIcon className="h-4 w-4 shrink-0 text-neutral-muted" />
              <label htmlFor="feed-search" className="sr-only">
                Buscar no feed
              </label>
              <input
                id="feed-search"
                type="search"
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Buscar"
                className="w-full min-w-0 bg-transparent text-xs font-medium leading-5 outline-none placeholder:text-neutral-muted"
              />
            </div>
          ) : null}

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 hover:bg-secondary-light/20"
            aria-label="Notificações"
          >
            <BellIcon className="h-5 w-5" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="relative h-10 w-10 overflow-hidden rounded-full bg-primary-dark ring-2 ring-pastel-support/30 transition-all hover:ring-pastel-support/60"
              aria-label="Abrir menu de perfil"
              aria-expanded={menuOpen}
            >
              {profileAvatarUrl ? (
                <img
                  src={profileAvatarUrl}
                  alt={user?.name ? `${user.name} - foto do perfil` : "Foto do perfil"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  <span className="absolute inset-x-[9px] top-[7px] h-[10px] rounded-full bg-white" />
                  <span className="absolute left-[11px] top-[14px] h-[8px] w-[18px] rounded-t-full bg-primary-dark/20" />
                  <span className="absolute bottom-0 left-[7px] h-[19px] w-[26px] rounded-t-[16px] bg-secondary-light" />
                  <span className="absolute bottom-[2px] left-[13px] h-[11px] w-[14px] rounded-t-full bg-primary-dark" />
                </>
              )}
            </button>

            {menuOpen ? (
              <div
                ref={menuRef}
                className="absolute right-0 top-[calc(100%_+_12px)] z-20 w-44 rounded-2xl border border-pastel-support/30 bg-white py-2 shadow-soft"
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/perfil");
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-semibold text-primary-dark transition-colors duration-200 hover:bg-secondary-light/20"
                >
                  Meu perfil
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-semibold text-neutral-muted transition-colors duration-200 hover:bg-secondary-light/20"
                >
                  Sair da conta
                </button>
              </div>
            ) : null}
          </div>

        </div>
      </div>
    </header>
  );
}


