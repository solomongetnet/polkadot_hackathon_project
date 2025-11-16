"use client";
import { Button } from "@/components/ui/button";

const PaginationButton = ({
  hasMore,
  refetch,
  isFetching,
}: {
  hasMore: boolean;
  refetch: any;
  isFetching: boolean;
}) => {
  const handleMore = () => {
    refetch();
  };

  if (!hasMore) {
    return;
  }

  return (
    <div className="w-full pt-6 flex justify-center">
      <Button
        onClick={handleMore}
        variant="link"
        disabled={!hasMore || isFetching}
      >
        {isFetching ? "Loading..." : "More characters"}
      </Button>
    </div>
  );
};

export default PaginationButton;
