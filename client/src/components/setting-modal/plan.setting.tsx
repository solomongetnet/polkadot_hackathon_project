import React, { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useGetActiveUserPlanQuery } from "@/hooks/api/use-plan";
import { Skeleton } from "../ui/skeleton";
import {
  format,
  isPast,
  differenceInDays,
  formatDistanceToNow,
} from "date-fns";
import { useModalStore } from "@/store/ui-store";
import { ChevronDown } from "lucide-react";

const PlanSetting = ({
  setIsSettingsModalOpen,
}: {
  setIsSettingsModalOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const { setUpgradeModalOpen } = useModalStore();
  const getActiveUserPlanQuery = useGetActiveUserPlanQuery();

  const handleOpenUpgradeModal = () => {
    setIsSettingsModalOpen(false);
    setUpgradeModalOpen(true);
  };

  return getActiveUserPlanQuery.isPending ? (
    <ul className="w-full flex flex-col gap-2">
      <Skeleton className="w-full h-[70px] border rounded-2xl p-2 sm:p-3 flex justify-between items-center" />
    </ul>
  ) : getActiveUserPlanQuery.isError ? (
    <div className="py-8 flex justify-center items-center">
      Something went wrong
    </div>
  ) : (
    <ul className="w-full flex flex-col gap-2">
      {getActiveUserPlanQuery.data ? (
        <li className="w-full border rounded-2xl p-2 sm:p-3 flex justify-between items-center">
          <div className="flex flex-col">
            <p className="text-xs text-muted-foreground">Your current plan</p>
            <h2>{getActiveUserPlanQuery.data.plan.name}</h2>
          </div>

          <h2 className="text-sm">
            {(() => {
              const endDate = new Date(getActiveUserPlanQuery.data.endDate);
              const daysLeft = differenceInDays(endDate, new Date());

              if (isPast(endDate)) {
                return `Expired on ${format(endDate, "PPP")}`;
              }

              if (daysLeft <= 7) {
                return `Expires in ${formatDistanceToNow(endDate, {
                  addSuffix: false,
                })}`;
              }

              return `Expires on ${format(endDate, "PPP")}`;
            })()}
          </h2>
        </li>
      ) : (
        <li className="w-full border rounded-2xl p-2 sm:p-3 flex justify-between items-center">
          <div className="flex flex-col">
            <p className="text-xs text-muted-foreground">Your current plan</p>
            <h2>Free</h2>
          </div>
          <Button className="rounded-full" onClick={handleOpenUpgradeModal}>
            Upgrade now
          </Button>
        </li>
      )}

      <div className="pt-4 w-full flex justify-center items-center">
        <Button variant={"link"} size={"sm"}>
          Plan histroy <ChevronDown />
        </Button>
      </div>
    </ul>
  );
};

export default PlanSetting;
