import { Skeleton } from "@/components/ui/skeleton";

// Loading Skeleton Component
export const CharacterLoadingSkeleton = () => (
  <div className="p-6">
    {/* Header Skeleton */}
    <div className="flex items-start gap-4 mb-6">
      <Skeleton className="w-16 h-16 rounded-full" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>

    {/* About Skeleton */}
    <div className="mb-4">
      <Skeleton className="h-4 w-16 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-3/4 mb-1" />
      <Skeleton className="h-4 w-1/2" />
    </div>

    {/* Personality Skeleton */}
    <div className="mb-4">
      <Skeleton className="h-4 w-20 mb-2" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-18" />
      </div>
    </div>

    {/* Voice Style Skeleton */}
    <div className="mb-6">
      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-6 w-24" />
    </div>

    {/* Actions Skeleton */}
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </div>
  </div>
);
