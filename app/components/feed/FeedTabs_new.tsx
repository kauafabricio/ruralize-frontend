"use client";

import { useEffect, useState } from "react";

import { getGeneralFeed, getFriendsFeed } from "@/app/services/api/feed.api";
import type { PostResponse } from "@/app/services/api/posts.api";
import { useAuth } from "../auth/AuthProvider";

import { PostComposer } from "./PostComposer";
import { FeedSkeleton } from "./FeedSkeleton";

const feedTabs = [
  { id: "friends", label: "Amigos", description: "Feed de amigos" },
  { id: "network", label: "Rede", description: "Feed da rede geral" },
] as const;

const feedFilters = [
  { id: "all", label: "Todos" },
  { id: "events", label: "Eventos" },
  { id: "warnings", label: "Avisos" },
  { id: "projects", label: "Projetos" },
  { id: "recent", label: "Recentes" },
] as const;

type FeedTabId = (typeof feedTabs)[number]["id"];
type FeedFilterId = (typeof feedFilters)[number]["id"];

type FeedPost = PostResponse;

function FeedPostCard({ post }: { post: FeedPost }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "agora";
    if (diffMins < 60) return `há ${diffMins}m`;
    if (diffHours < 24) return `há ${diffHours}h`;
    if (diffDays === 1) return "ontem";
    if (diffDays < 7) return `há ${diffDays}d`;
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <article className="overflow-hidden rounded-[28px] bg-white shadow-[0_1px_0_rgba(33,55,30,0.04)]">
      <div className="px-6 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#205f36] text-[12px] font-black uppercase text-white">
              {post.user_id.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-black text-[#1f6f2a]">
                {post.user_id}
              </p>
              <p className="text-[12px] text-[#6c7b6d]">
                {post.sustainable_action}
              </p>
            </div>
          </div>

          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8b998d]">
            {formatDate(post.created_at)}
          </span>
        </div>

        <p className="mt-5 text-sm leading-6 text-[#20281f]">{post.content}</p>

        {post.image_url && (
          <div className="mt-4 overflow-hidden rounded-[14px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image_url}
              alt="Post image"
              className="h-auto w-full"
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[#eff1eb] px-6 py-4 text-[12px] text-[#4f5b4e]">
        <span className="font-semibold">{post.likes} curtidas</span>
        <span>{post.comments.length} comentários</span>
      </div>
    </article>
  );
}

function FeedPostList({ posts }: { posts: FeedPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-[28px] bg-white px-6 py-8 text-center text-sm text-[#4f5b4e] shadow-[0_1px_0_rgba(33,55,30,0.04)]">
        Nenhum resultado encontrado para sua busca.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <FeedPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

export function FeedTabs({ searchTerm }: { searchTerm: string }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedTabId>("friends");
  const [activeFilter, setActiveFilter] = useState<FeedFilterId>("all");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, [activeTab, user?.id]);

  async function loadPosts() {
    setLoading(true);
    setError(null);

    try {
      let data: FeedPost[] = [];

      if (activeTab === "friends" && user?.id) {
        data = await getFriendsFeed(user.id);
      } else {
        data = await getGeneralFeed(user?.id);
      }

      setPosts(data);
    } catch (err) {
      console.error("Erro ao carregar feed:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao carregar o feed"
      );
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  async function handlePostCreated() {
    await loadPosts();
  }

  const activeIndex = feedTabs.findIndex((tab) => tab.id === activeTab);
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredPosts = posts.filter((post) => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "recent" &&
        new Date(post.created_at).getTime() > Date.now() - 3600000) ||
      post.sustainable_action === activeFilter;

    if (!matchesFilter) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return [post.content, post.sustainable_action].some((value) =>
      value?.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <>
      <div
        className="relative mb-8 inline-flex items-center gap-11 pl-1 text-[12px] font-semibold text-[#30372f]"
        role="tablist"
        aria-label="Tipo de feed"
      >
        <span
          className="absolute bottom-[-12px] left-[13px] h-[3px] w-[64px] rounded-full bg-[#287630] transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${activeIndex * 134}px)` }}
          aria-hidden="true"
        />

        {feedTabs.map((tab) => {
          const active = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`${tab.id}-feed-panel`}
              id={`${tab.id}-feed-tab`}
              onClick={() => setActiveTab(tab.id)}
              className={`relative w-[90px] rounded-full py-3 transition-all duration-300 ease-out ${
                active
                  ? "bg-white font-black text-[#287630] shadow-[0_1px_0_rgba(33,55,30,0.04)]"
                  : "text-[#30372f] hover:text-[#287630]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        className="mb-7 flex flex-wrap items-center gap-2 rounded-[20px] border border-[#ecf0e8] bg-[#fbfcf7] px-3 py-2 shadow-[0_1px_0_rgba(33,55,30,0.04)]"
        aria-label="Filtros do feed"
      >
        {feedFilters.map((filter) => {
          const active = filter.id === activeFilter;

          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`h-8 rounded-full px-3 text-[12px] font-bold transition-all duration-200 ${
                active
                  ? "bg-[#287630] text-white shadow-[0_6px_14px_rgba(40,118,48,0.16)]"
                  : "bg-white text-[#566154] ring-1 ring-[#e5eadf] hover:text-[#287630]"
              }`}
              aria-pressed={active}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {feedTabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${tab.id}-feed-panel`}
          aria-labelledby={`${tab.id}-feed-tab`}
          hidden={activeTab !== tab.id}
          className="space-y-7"
        >
          <span className="sr-only">{tab.description}</span>
          {searchTerm ? (
            <p className="text-sm font-medium text-[#4f5b4e]">
              Buscando por "{searchTerm}"
            </p>
          ) : null}
          <PostComposer onPostCreated={handlePostCreated} />

          {loading ? (
            <FeedSkeleton />
          ) : error ? (
            <div className="rounded-[28px] bg-white px-6 py-8 text-center text-sm text-red-600 shadow-[0_1px_0_rgba(33,55,30,0.04)]">
              {error}
            </div>
          ) : (
            <FeedPostList posts={filteredPosts} />
          )}
        </div>
      ))}
    </>
  );
}
