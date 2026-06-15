"use client";

import { useCallback, useEffect, useState } from "react";

import { getGeneralFeed, getFollowingFeed } from "@/app/services/api/feed.api";
import type { PostResponse } from "@/app/services/api/posts.api";
import { useAuth } from "@/app/components/auth/AuthProvider";
import {
  getActionIcon,
  getActionName,
} from "@/app/lib/sustainableActions";

import { PostComposer } from "./PostComposer";
import { FeedSkeletonList } from "./FeedSkeleton";
import { PostCard } from "./PostCard";

const feedTabs = [
  { id: "following", label: "Seguindo", description: "Postagens dos usuários que você segue" },
  { id: "network", label: "Rede", description: "Feed da rede geral" },
] as const;

const DEFAULT_FILTER_IDS = [
  "all",
  "general",
  "tree-planting",
  "recycling",
  "water-conservation",
  "energy-efficiency",
  "composting",
  "biodiversity",
  "sustainable-agriculture",
  "clean-energy",
  "pollution-reduction",
  "education",
  "recent",
] as const;

type FeedTabId = (typeof feedTabs)[number]["id"];
type FeedFilterId = (typeof DEFAULT_FILTER_IDS)[number];

function FeedPostList({
  posts,
  onPostUpdated,
}: {
  posts: PostResponse[];
  onPostUpdated: () => void;
}) {
  if (posts.length === 0) {
    return (
      <div className="rounded-3xl bg-white px-6 py-8 text-center text-sm text-gray-700 shadow-md">
        Nenhum resultado encontrado para sua busca.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onPostUpdated={onPostUpdated} />
      ))}
    </div>
  );
}

export function FeedTabs({ searchTerm }: { searchTerm: string }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [activeTab, setActiveTab] = useState<FeedTabId>("following");
  const [activeFilter, setActiveFilter] = useState<FeedFilterId>("all");
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentThreshold] = useState(() => Date.now() - 3600000);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let data: PostResponse[] = [];

      if (activeTab === "following" && userId) {
        try {
          data = await getFollowingFeed(userId);
        } catch (followingFeedError) {
          console.warn(
            "Erro ao carregar feed de seguindo, usando feed geral:",
            followingFeedError,
          );
          data = await getGeneralFeed(userId);
        }
      } else {
        data = await getGeneralFeed(userId);
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
  }, [activeTab, userId]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadPosts();
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [loadPosts]);

  async function handlePostCreated() {
    await loadPosts();
  }

  const activeIndex = feedTabs.findIndex((tab) => tab.id === activeTab);
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredPosts = posts.filter((post) => {
    const actionId = post.sustainable_action_id || post.sustainable_action;
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "recent" &&
        new Date(post.created_at).getTime() > recentThreshold) ||
      actionId === activeFilter ||
      (activeFilter === "general" && (!actionId || actionId === "general"));

    if (!matchesFilter) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const actionText = post.sustainable_action_id || post.sustainable_action;
    return [post.content, actionText].some((value) =>
      value?.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <>
      <div
        className=”relative mb-8 inline-flex items-center gap-11 pl-1 text-[12px] font-semibold text-gray-900”
        role=”tablist”
        aria-label=”Tipo de feed”
      >
        <span
          className=”absolute bottom-[-12px] left-[13px] h-[3px] w-[64px] rounded-full bg-primary-dark transition-transform duration-300 ease-out”
          style={{ transform: `translateX(${activeIndex * 134}px)` }}
          aria-hidden=”true”
        />

        {feedTabs.map((tab) => {
          const active = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type=”button”
              role=”tab”
              aria-selected={active}
              aria-controls={`${tab.id}-feed-panel`}
              id={`${tab.id}-feed-tab`}
              onClick={() => setActiveTab(tab.id)}
              className={`relative w-[90px] rounded-full py-3 transition-all duration-300 ease-out ${
                active
                  ? “bg-white font-black text-primary-dark shadow-md”
                  : “text-gray-700 hover:text-primary-dark hover:bg-gray-50”
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        className=”mb-7 flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm”
        aria-label=”Filtros do feed”
      >
        {DEFAULT_FILTER_IDS.map((filterId) => {
          const active = filterId === activeFilter;
          let displayLabel: string;

          if (filterId === “all”) {
            displayLabel = “Todos”;
          } else if (filterId === “recent”) {
            displayLabel = “Recentes”;
          } else if (filterId === “general”) {
            displayLabel = “🌍 Sem ação”;
          } else {
            const actionIcon = getActionIcon(filterId);
            const actionName = getActionName(filterId);
            displayLabel = `${actionIcon} ${actionName}`;
          }

          return (
            <button
              key={filterId}
              type=”button”
              onClick={() => setActiveFilter(filterId as FeedFilterId)}
              className={`h-8 rounded-full px-3 text-[12px] font-bold transition-all duration-200 ${
                active
                  ? “bg-primary-dark text-white shadow-md”
                  : “bg-gray-50 text-gray-600 border border-gray-200 hover:text-primary-dark hover:border-gray-300”
              }`}
              aria-pressed={active}
            >
              {displayLabel}
            </button>
          );
        })}
      </div>

      {feedTabs.map((tab) => (
        <div
          key={tab.id}
          role=”tabpanel”
          id={`${tab.id}-feed-panel`}
          aria-labelledby={`${tab.id}-feed-tab`}
          hidden={activeTab !== tab.id}
          className=”space-y-7”
        >
          <span className=”sr-only”>{tab.description}</span>
          {searchTerm ? (
            <p className=”text-sm font-medium text-gray-700”>
              Buscando por “{searchTerm}”
            </p>
          ) : null}
          <PostComposer onPostCreated={handlePostCreated} />

          {loading ? (
            <FeedSkeletonList />
          ) : error ? (
            <div className=”rounded-3xl bg-white px-6 py-8 text-center text-sm text-red-600 shadow-md”>
              {error}
            </div>
          ) : (
            <FeedPostList posts={filteredPosts} onPostUpdated={loadPosts} />
          )}
        </div>
      ))}
    </>
  );
}
