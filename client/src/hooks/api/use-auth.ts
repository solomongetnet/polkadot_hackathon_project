import { authClient } from "@/lib/auth-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSignInWithEmailMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; password: string }) => {
      return authClient.signIn.email(data, {
        onSuccess: () => {
          toast.message("Login successfull");
          queryClient.invalidateQueries({ queryKey: ["chats"] });
        },
        onError: ({ error }) => {
          toast.error(error.message);
        },
      });
    },
  });
};

export const useSignUpWithEmailMutation = () => {
  return useMutation({
    mutationFn: ({
      data,
      callbackURL,
    }: {
      data: { name: string; email: string; password: string };
      callbackURL: string | null;
    }) => {
      return authClient.signUp.email(
        { callbackURL: callbackURL || "", ...data },
        {
          onSuccess: () => {
            toast.message("Your account has been created successfully");
          },
          onError: ({ error }) => {
            toast.error(error.message);
            throw new Error("");
          },
        }
      );
    },
  });
};
