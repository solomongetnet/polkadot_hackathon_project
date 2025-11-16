"use client";

import { useInitPlansMutation } from "@/hooks/api/use-plan";
import { paidNow } from "@/server/actions/test.actions";

export default function PaymentButton() {
  const mutation = useInitPlansMutation();

  const handleClick = async () => {
    // mutation.mutate();
    await paidNow();
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-green-600 text-white rounded-md"
    >
      Init Plans{" "}
    </button>
  );
}
