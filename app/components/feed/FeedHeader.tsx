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
    <header className="h-[72px] border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto flex h-full max-w-[1220px] items-center justify-between px-7">
        <Link
          href="/feed"
          className="text-[16px] font-black leading-none tracking-[-0.03em] text-primary-dark"
          aria-label="Ruralize"
        >
          Ruralize
        </Link>

        <nav
          ref={navRef}
          className="relative ml-[110px] flex h-full items-center gap-10 text-[11px] font-semibold text-gray-700"
        >
          <span
            className="absolute top-[45px] h-[3px] w-8 rounded-full bg-primary-dark transition-[left,opacity] duration-300 ease-out"
            style={{
              left: indicatorStyle.left,
              opacity: indicatorStyle.opacity,
            }}
            aria-hidden="true"
          />

          {navItems.map((item) => {
            const active = item.label === activeSection;
            const itemClassName = `relative flex h-full items-center whitespace-nowrap px-1 pt-1 transition-colors duration-300 ${
              active ? "font-black text-primary-dark" : "hover:text-primary-dark"
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

        <div className="flex items-center gap-4 text-gray-900">
          {showSearch ? (
            <div className="flex h-8 w-[116px] items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2 text-gray-600 shadow-sm transition duration-200 hover:border-gray-300">
              <SearchIcon className="h-[14px] w-[14px] shrink-0 text-gray-500" />
              <label htmlFor="feed-search" className="sr-only">
                Buscar no feed
              </label>
              <input
                id="feed-search"
                type="search"
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Buscar"
                className="w-full min-w-0 bg-transparent text-[12px] font-medium leading-5 outline-none placeholder:text-gray-400"
              />
            </div>
          ) : null}

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:bg-gray-100"
            aria-label="Notificações"
          >
            <BellIcon className="h-[18px] w-[18px] text-gray-700" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="relative h-10 w-10 overflow-hidden rounded-full bg-primary-dark ring-2 ring-secondary transition-all duration-200 hover:ring-[3px]"
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
                  <span className="absolute left-[11px] top-[14px] h-[8px] w-[18px] rounded-t-full bg-primary-dark" />
                  <span className="absolute bottom-0 left-[7px] h-[19px] w-[26px] rounded-t-[16px] bg-secondary" />
                  <span className="absolute bottom-[2px] left-[13px] h-[11px] w-[14px] rounded-t-full bg-primary-dark" />
                </>
              )}
            </button>

            {menuOpen ? (
              <div
                ref={menuRef}
                className="absolute right-0 top-[calc(100%_+_10px)] z-20 w-[180px] rounded-2xl border border-gray-200 bg-white py-2 shadow-lg"
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/perfil");
                  }}
                  className="w-full px-4 py-3 text-left text-[13px] font-semibold text-primary-dark transition-colors duration-150 hover:bg-gray-50"
                >
                  Meu perfil
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full px-4 py-3 text-left text-[13px] font-semibold text-gray-600 transition-colors duration-150 hover:bg-gray-50"
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


