import { Skeleton } from './skeleton';

export function DetailSkeleton() {
  return (
    <div className="w-full aspect-video bg-card rounded-xl p-8">
      <div className="h-full flex flex-col gap-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="flex-1 w-full" />
      </div>
    </div>
  );
} 