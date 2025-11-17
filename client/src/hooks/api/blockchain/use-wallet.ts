import {
  connectWalletAddressToUserAction,
  disconnectWalletAddressFromUserAction,
} from "@/server/actions/wallet.actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useConnectWalletToUserMutation = () => {
  return useMutation({
    mutationFn: ({ address }: { address: string }) =>
      connectWalletAddressToUserAction({
        address,
      }),
    onSuccess: ({ success, error, message }) => {
      if (error) {
        toast.error(error.message);
      } else {
        toast.message(message);
      }
    },
  });
};

export const useDisConnectWalletToUserMutation = () => {
  return useMutation({
    mutationFn: () => disconnectWalletAddressFromUserAction(),
    onSuccess: ({ success, error, message }) => {
      if (error) {
        toast.error(error.message);
      } else {
        toast.message(message);
      }
    },
  });
};
