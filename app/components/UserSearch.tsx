"use client";

import Link from "next/link";
import { useState } from "react";
import {
  searchProfilesByName,
  searchProfilesByRole,
  getAllProfiles,
  type UserProfileResponse,
} from "@/app/services/api/profile.api";
import type { UserRole } from "@/app/services/api/auth.api";
import { Toast } from "@/app/components/Toast";

type SearchType = "name" | "role" | "all";

export function UserSearch() {
  const [searchType, setSearchType] = useState<SearchType>("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<UserProfileResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const roles = ["student", "teacher"] as const;

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);

    try {
      let data: UserProfileResponse[] = [];

      if (searchType === "name" && searchQuery.trim()) {
        data = await searchProfilesByName(searchQuery);
      } else if (searchType === "role" && searchQuery) {
        data = await searchProfilesByRole(searchQuery as UserRole);
      } else if (searchType === "all") {
        data = await getAllProfiles();
      }

      setResults(data);

      if (data.length === 0 && searchType !== "all") {
        setToast({
          message: "Nenhum resultado encontrado",
          type: "error",
        });
      } else if (data.length > 0) {
        setToast({
          message: `${data.length} usuário${data.length !== 1 ? "s" : ""} encontrado${data.length !== 1 ? "s" : ""}`,
          type: "success",
        });
      }
    } catch (err) {
      setToast({
        message:
          err instanceof Error ? err.message : "Erro ao buscar usuários",
        type: "error",
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-soft-xs">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <h1 className="mb-6 text-2xl font-bold text-primary-dark">
        Buscar Usuários
      </h1>

      <form onSubmit={handleSearch} className="space-y-5">
        {/* Search Type Selection */}
        <div className="flex gap-2 flex-wrap">
          {(["name", "role", "all"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setSearchType(type);
                setSearchQuery("");
                setResults([]);
                setHasSearched(false);
              }}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                searchType === type
                  ? "bg-primary-dark text-white shadow-soft"
                  : "bg-neutral-light text-neutral-darker hover:bg-white"
              }`}
            >
              {type === "name"
                ? "Por Nome"
                : type === "role"
                  ? "Por Papel"
                  : "Todos"}
            </button>
          ))}
        </div>

        {/* Search Input */}
        {searchType !== "all" && (
          <div>
            {searchType === "name" && (
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digite o nome do usuário..."
                className="w-full rounded-full border border-pastel-support bg-neutral-light px-6 py-3 text-sm outline-none placeholder:text-neutral-muted"
              />
            )}

            {searchType === "role" && (
              <select
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-pastel-support bg-neutral-light px-6 py-3 text-sm outline-none"
              >
                <option value="">Selecione o papel...</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role === "student" ? "Estudante" : "Professor"}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Search Button */}
        <button
          type="submit"
          disabled={loading || (searchType !== "all" && !searchQuery.trim())}
          className="w-full rounded-full bg-primary-dark py-3 text-sm font-bold text-white shadow-soft transition-opacity disabled:opacity-50 hover:bg-primary-darker"
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {/* Results */}
      {hasSearched && (
        <div className="mt-8">
          {loading ? (
            <div className="py-8 text-center text-neutral-muted">
              Carregando resultados...
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-neutral-muted">
              Nenhum resultado encontrado
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-neutral-muted">
                {results.length} resultado{results.length !== 1 ? "s" : ""}
                encontrado{results.length !== 1 ? "s" : ""}
              </p>

              {results.map((profile) => (
                <Link
                  key={profile.id}
                  href={`/perfil/${profile.id}`}
                  className="flex items-center gap-4 rounded-xl border border-neutral-light bg-white p-4 hover:shadow-soft transition-shadow"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-dark text-xs font-bold uppercase text-white">
                    {profile.name.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-primary-dark">
                      {profile.name}
                    </p>
                    <p className="text-xs text-neutral-darker">
                      {profile.role === "student" ? "Estudante" : "Professor"}
                    </p>

                    {profile.description && (
                      <p className="mt-1 text-xs text-neutral-muted truncate">
                        {profile.description}
                      </p>
                    )}
                  </div>

                  <span className="rounded-full bg-primary-dark px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-primary-darker">
                    Ver Perfil
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
