// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import {
  inferAdditionalFields,
  customSessionClient,
} from "better-auth/client/plugins";
import { auth } from "./auth";
import { useAuthStore } from "@/store/auth-store";

export const authClient = createAuthClient({
  fetchOptions: {
    credentials: "include",
    async onSuccess(context) {
      const user = context?.data ?? null;

      // // Update Zustand store with user info and status
      // useAuthStore.setState({
      //   currentUser: {
      //     user,
      //     status: "success",
      //     error: undefined,
      //   },
      // });
    },
  },
  plugins: [
    inferAdditionalFields<typeof auth>(),
    customSessionClient<typeof auth>(),
  ],
});
