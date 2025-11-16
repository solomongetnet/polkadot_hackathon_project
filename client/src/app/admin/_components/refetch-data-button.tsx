import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { IterationCw } from "lucide-react";
import React from "react";

// Utility types to enforce either refetch or queryKey is required
type RefetchProps = {
  refetch: () => void;
  queryKey?: never;
};

type QueryKeyProps = {
  queryKey: string;
  refetch?: never;
};

type CommonProps = {
  isLoading: boolean;
};

type RefetchDataButtonProps = (RefetchProps | QueryKeyProps) & CommonProps;

const RefetchDataButton = ({
  refetch,
  queryKey,
  isLoading,
}: RefetchDataButtonProps) => {
  const queryClient = useQueryClient();

  const handleRefetchData = () => {
    if (refetch) {
      refetch();
    } else if (queryKey) {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    }
  };

  return (
    <Button
      size="icon"
      onClick={handleRefetchData}
      disabled={isLoading}
      variant="ghost"
    >
      <IterationCw className={isLoading ? "animate-spin h-4 w-4" : "h-4 w-4"} />
    </Button>
  );
};

export default RefetchDataButton;
