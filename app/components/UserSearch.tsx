"use client";

import { useState, useEffect } from "react";
import {
  searchProfilesByName,
  searchProfilesByCourse,
  searchProfilesByRole,
  searchProfilesByTags,
  getAllProfiles,
  type UserProfileResponse,
} from "@/app/services/api/profile.api";
import { Toast } from "../Toast";

type SearchType = "name" | "course" | "role" | "tags" | "all";

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

  const courses = [
    "Agronomia",
    "Engenharia Florestal",
    "Engenharia de Alimentos",
    "Zootecnia",
    "Medicina Veterinária",
    "Educação Física",
  ];

  const roles = ["student", "teacher"] as const;

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);

    try {
      let data: UserProfileResponse[] = [];

      if (searchType === "name" && searchQuery.trim()) {
        data = await searchProfilesByName(searchQuery);
      } else if (searchType === "course" && searchQuery) {
        data = await searchProfilesByCourse(searchQuery);
      } else if (searchType === "role" && searchQuery) {
        data = await searchProfilesByRole(searchQuery as any);
      } else if (searchType === "tags" && searchQuery.trim()) {
        const tags = searchQuery.split(",").map((t) => t.trim());
        data = await searchProfilesByTags(tags);
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
    <div className="mx-auto w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-[0_1px_0_rgba(33,55,30,0.04)]">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <h1 className="mb-6 text-2xl font-black text-[#1f6f2a]">
        Buscar Usuários
      </h1>

      <form onSubmit={handleSearch} className="space-y-5">
        {/* Search Type Selection */}
        <div className="flex gap-2 flex-wrap">
          {(["name", "course", "role", "tags", "all"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setSearchType(type);
                setSearchQuery("");
                setResults([]);
                setHasSearched(false);
              }}
              className={`rounded-full px-4 py-2 text-[12px] font-bold transition-all ${
                searchType === type
                  ? "bg-[#287630] text-white shadow-[0_6px_14px_rgba(40,118,48,0.16)]"
                  : "bg-[#f4f5f0] text-[#566154] ring-1 ring-[#e5eadf] hover:bg-white"
              }`}
            >
              {type === "name"
                ? "Por Nome"
                : type === "course"
                  ? "Por Curso"
                  : type === "role"
                    ? "Por Papel"
                    : type === "tags"
                      ? "Por Tags"
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
                className="w-full rounded-full border border-[#e5eadf] bg-[#f4f5f0] px-6 py-3 text-[13px] outline-none placeholder:text-[#a4aaa0]"
              />
            )}

            {searchType === "course" && (
              <select
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-[#e5eadf] bg-[#f4f5f0] px-6 py-3 text-[13px] outline-none"
              >
                <option value="">Selecione um curso...</option>
                {courses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            )}

            {searchType === "role" && (
              <select
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-[#e5eadf] bg-[#f4f5f0] px-6 py-3 text-[13px] outline-none"
              >
                <option value="">Selecione o papel...</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role === "student" ? "Estudante" : "Professor"}
                  </option>
                ))}
              </select>
            )}

            {searchType === "tags" && (
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digite as tags separadas por vírgula..."
                className="w-full rounded-full border border-[#e5eadf] bg-[#f4f5f0] px-6 py-3 text-[13px] outline-none placeholder:text-[#a4aaa0]"
              />
            )}
          </div>
        )}

        {/* Search Button */}
        <button
          type="submit"
          disabled={loading || (searchType !== "all" && !searchQuery.trim())}
          className="w-full rounded-full bg-[#287630] py-3 text-[13px] font-bold text-white shadow-[0_10px_18px_rgba(40,118,48,0.26)] transition-opacity disabled:opacity-50 hover:bg-[#1f6428]"
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {/* Results */}
      {hasSearched && (
        <div className="mt-8">
          {loading ? (
            <div className="py-8 text-center text-[#4f5b4e]">
              Carregando resultados...
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-[#4f5b4e]">
              Nenhum resultado encontrado
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[12px] font-semibold text-[#8a9186]">
                {results.length} resultado{results.length !== 1 ? "s" : ""}
                encontrado{results.length !== 1 ? "s" : ""}
              </p>

              {results.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center gap-4 rounded-[18px] border border-[#e5eadf] bg-[#f8f8f3] p-4 hover:shadow-[0_4px_12px_rgba(33,55,30,0.08)] transition-shadow"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#205f36] text-[12px] font-black uppercase text-white">
                    {profile.name.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-[#1f6f2a]">
                      {profile.name}
                    </p>
                    <p className="text-[12px] text-[#6c7b6d]">
                      {profile.role === "student" ? "Estudante" : "Professor"}
                      {profile.course && ` • ${profile.course}`}
                    </p>

                    {profile.description && (
                      <p className="mt-1 text-[12px] text-[#4f5b4e] truncate">
                        {profile.description}
                      </p>
                    )}

                    {profile.tags && profile.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {profile.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-block rounded-full bg-[#e7f1e5] px-2 py-0.5 text-[11px] text-[#287630]"
                          >
                            {tag}
                          </span>
                        ))}
                        {profile.tags.length > 3 && (
                          <span className="text-[11px] text-[#8a9186]">
                            +{profile.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button className="rounded-full bg-[#287630] px-4 py-2 text-[11px] font-black text-white transition-colors hover:bg-[#1f6428]">
                    Ver Perfil
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
