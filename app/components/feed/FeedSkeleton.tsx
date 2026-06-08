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
    <article className="overflow-hidden bg-white shadow-[0_1px_0_rgba(33,55,30,0.04)]">
      <div className="px-6 pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="h-11 w-11 animate-pulse rounded-full bg-[#e0e6d9]" />
            <span className="space-y-2">
              <span className="block h-3 w-28 animate-pulse rounded-full bg-[#e0e6d9]" />
              <span className="block h-2.5 w-44 animate-pulse rounded-full bg-[#edf0e8]" />
            </span>
          </div>
          <MoreIcon className="h-5 w-5 text-[#20281f]" />
        </div>

        <div className="mt-6 space-y-3">
          <span className="block h-3 w-full animate-pulse rounded-full bg-[#e5e9df]" />
          <span className="block h-3 w-[88%] animate-pulse rounded-full bg-[#e5e9df]" />
          <span className="block h-3 w-[46%] animate-pulse rounded-full bg-[#eff1eb]" />
        </div>
      </div>

      <div
        className={`mt-7 animate-pulse bg-[linear-gradient(110deg,#e1e7da_8%,#eef2e9_18%,#e1e7da_33%)] bg-[length:200%_100%] ${
          large ? "h-[430px]" : "h-[285px]"
        }`}
      />

      <div className="flex h-[70px] items-center gap-7 px-6 text-[#20281f]">
        <span className="inline-flex items-center gap-2 text-[12px] font-semibold">
          <HeartIcon className="h-[18px] w-[18px]" />
          <span className="h-2.5 w-5 animate-pulse rounded-full bg-[#e5e9df]" />
        </span>
        <span className="inline-flex items-center gap-2 text-[12px] font-semibold">
          <MessageIcon className="h-[18px] w-[18px]" />
          <span className="h-2.5 w-5 animate-pulse rounded-full bg-[#e5e9df]" />
        </span>
      </div>
    </article>
  );
}
