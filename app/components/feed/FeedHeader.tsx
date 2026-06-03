"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/app/components/auth/AuthProvider";
import { BellIcon, SearchIcon } from "./FeedIcons";

const PROFILE_AVATAR_STORAGE_KEY = "ruralize.profile.avatarUrl";

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
  const [storedProfileAvatarUrl, setStoredProfileAvatarUrl] = useState<
    string | undefined
  >(undefined);
  const profileAvatarUrl = user?.avatarUrl ?? storedProfileAvatarUrl;
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
    function syncStoredAvatar() {
      setStoredProfileAvatarUrl(readStoredProfileAvatarUrl());
    }

    const initialAvatarTimeout = window.setTimeout(syncStoredAvatar, 0);
    window.addEventListener("ruralize.avatar.update", syncStoredAvatar);

    return () => {
      window.clearTimeout(initialAvatarTimeout);
      window.removeEventListener("ruralize.avatar.update", syncStoredAvatar);
    };
  }, []);

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
            const itemClassName = `relative flex h-full items-center whitespace-nowrap px-1 pt-1 transition-colors duration-300 ${
              active ? "font-black text-[#1f6f2a]" : "hover:text-[#1f6f2a]"
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

        <div className="flex items-center gap-4 text-[#101510]">
          {showSearch ? (
            <div className="flex h-8 w-[116px] items-center gap-1.5 rounded-full border border-[#e4e8df] bg-[#f6f7f1] px-2 text-[#30372f] shadow-[0_1px_0_rgba(33,55,30,0.04)]">
              <SearchIcon className="h-[14px] w-[14px] shrink-0 text-[#7a877b]" />
              <label htmlFor="feed-search" className="sr-only">
                Buscar no feed
              </label>
              <input
                id="feed-search"
                type="search"
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Buscar"
                className="w-full min-w-0 bg-transparent text-[12px] font-medium leading-5 outline-none placeholder:text-[#9aa59a]"
              />
            </div>
          ) : null}

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#f0f2ea]"
            aria-label="Notificações"
          >
            <BellIcon className="h-[18px] w-[18px]" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="relative h-10 w-10 overflow-hidden rounded-full bg-[#225f35] ring-2 ring-[#e8efdf]"
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
                  <span className="absolute inset-x-[9px] top-[7px] h-[10px] rounded-full bg-[#f0b07b]" />
                  <span className="absolute left-[11px] top-[14px] h-[8px] w-[18px] rounded-t-full bg-[#273f2a]" />
                  <span className="absolute bottom-0 left-[7px] h-[19px] w-[26px] rounded-t-[16px] bg-[#e2ead8]" />
                  <span className="absolute bottom-[2px] left-[13px] h-[11px] w-[14px] rounded-t-full bg-[#29713b]" />
                </>
              )}
            </button>

            {menuOpen ? (
              <div
                ref={menuRef}
                className="absolute right-0 top-[calc(100%_+_10px)] z-20 w-[180px] rounded-[18px] border border-[#e4ebdf] bg-white py-2 shadow-[0_12px_30px_rgba(33,55,30,0.12)]"
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/perfil");
                  }}
                  className="w-full px-4 py-3 text-left text-[13px] font-semibold text-[#1f6f2a] transition-colors hover:bg-[#f4f6f1]"
                >
                  Meu perfil
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full px-4 py-3 text-left text-[13px] font-semibold text-[#8a9186] transition-colors hover:bg-[#f4f6f1]"
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

function readStoredProfileAvatarUrl() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.localStorage.getItem(PROFILE_AVATAR_STORAGE_KEY) ?? undefined;
}

