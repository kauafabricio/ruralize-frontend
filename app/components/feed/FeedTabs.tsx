"use client";

import { useState } from "react";

import { FeedSkeletonList } from "./FeedSkeleton";
import { PostComposer } from "./PostComposer";

const feedTabs = [
  { id: "friends", label: "Amigos", description: "Feed de amigos carregando" },
  { id: "network", label: "Rede", description: "Feed da rede geral carregando" },
] as const;

type FeedTabId = (typeof feedTabs)[number]["id"];

export function FeedTabs() {
  const [activeTab, setActiveTab] = useState<FeedTabId>("friends");
  const activeIndex = feedTabs.findIndex((tab) => tab.id === activeTab);

  return (
    <>
      <div
        className="relative mb-10 inline-flex items-center gap-11 pl-1 text-[12px] font-semibold text-[#30372f]"
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
          <PostComposer />
          <FeedSkeletonList />
        </div>
      ))}
    </>
  );
}
