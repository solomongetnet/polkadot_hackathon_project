import { submitCharacterReportAction } from "@/server/actions/report.actions";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useErrorToast } from "../use-error-toast";

export const useSubmitCharacterReportMutation = () => {
  const { showErrorToast } = useErrorToast();
  
  return useMutation({
    mutationFn: (data: {
      reason: string;
      details: string;
      characterId: string;
    }) => submitCharacterReportAction(data),
    onSuccess: ({ success, error, message }) => {
      if (success && message) {
        toast.message(message);
      } else {
        if (error?.code) {
          showErrorToast({
            code: error.code as any,
            message: error.message,
          });
          return;
        }

        toast.error(error?.message);
      }
    },
  });
};
