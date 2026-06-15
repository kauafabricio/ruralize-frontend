import { HeartIcon, MessageIcon, MoreIcon } from "./FeedIcons";

export function FeedSkeletonList() {
  return (
    <div className="space-y-6">
      <FeedPostSkeleton large />
      <FeedPostSkeleton />
    </div>
  );
}

function FeedPostSkeleton({ large = false }: { large?: boolean }) {
  return (
    <article className="overflow-hidden bg-white shadow-soft-xs border border-pastel-support/20 rounded-2xl">
      <div className="px-6 pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="h-11 w-11 animate-pulse rounded-full bg-neutral-light" />
            <span className="space-y-2">
              <span className="block h-3 w-28 animate-pulse rounded-full bg-neutral-light" />
              <span className="block h-2.5 w-44 animate-pulse rounded-full bg-white" />
            </span>
          </div>
          <MoreIcon className="h-5 w-5 text-neutral-darker" />
        </div>

        <div className="mt-6 space-y-3">
          <span className="block h-3 w-full animate-pulse rounded-full bg-neutral-light" />
          <span className="block h-3 w-[88%] animate-pulse rounded-full bg-neutral-light" />
          <span className="block h-3 w-[46%] animate-pulse rounded-full bg-white" />
        </div>
      </div>

      <div
        className={`mt-7 animate-pulse bg-[linear-gradient(110deg,#e8ede5_8%,#f5f7f3_18%,#e8ede5_33%)] bg-[length:200%_100%] ${
          large ? "h-[430px]" : "h-[285px]"
        }`}
      />

      <div className="flex h-[70px] items-center gap-7 px-6 text-neutral-darker">
        <span className="inline-flex items-center gap-2 text-xs font-semibold">
          <HeartIcon className="h-5 w-5" />
          <span className="h-2.5 w-5 animate-pulse rounded-full bg-neutral-light" />
        </span>
        <span className="inline-flex items-center gap-2 text-xs font-semibold">
          <MessageIcon className="h-5 w-5" />
          <span className="h-2.5 w-5 animate-pulse rounded-full bg-neutral-light" />
        </span>
      </div>
    </article>
  );
}
