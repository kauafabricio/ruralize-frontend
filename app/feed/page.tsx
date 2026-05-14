"use client";

import { useState } from "react";
import { RequireAuth } from "../components/auth/RequireAuth";
import { FeedHeader } from "../components/feed/FeedHeader";
import { FeedTabs } from "../components/feed/FeedTabs";
import { NewScheduleCard, SuggestionsCard } from "../components/feed/SideCards";

export default function FeedPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <RequireAuth>
      <main className="min-h-screen bg-[#f8f8f3] text-[#222a20]">
        <FeedHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        <div className="mx-auto grid w-full max-w-[1132px] grid-cols-[740px_360px] gap-9 px-1 pb-16 pt-11">
          <section>
            <FeedTabs searchTerm={searchTerm} />
          </section>

          <aside className="space-y-10 pt-0">
            <SuggestionsCard />
            <NewScheduleCard />
          </aside>
        </div>
      </main>
    </RequireAuth>
  );
}
