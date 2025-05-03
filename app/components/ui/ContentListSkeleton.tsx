import { Skeleton } from './skeleton';

export function ContentListSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex flex-col bg-card rounded-xl overflow-hidden">
          <Skeleton className="w-full aspect-video" />
          <div className="p-4 space-y-2.5">
            <Skeleton className="h-5 w-[85%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        </div>
      ))}
    </div>
  );
} 