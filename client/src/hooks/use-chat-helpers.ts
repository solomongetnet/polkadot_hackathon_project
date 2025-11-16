// hooks/use-chat-helpers.ts
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useChatStore } from "@/store";
import { useSidebar } from "@/components/ui/sidebar";

interface OpenChatArgs {
  chatId: string;
  refresh?: boolean;
  backgroundUrl?: string | null;
  themeId?: string | null;
  searchParams?: string;
}

export function useChatHelpers() {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { resetActiveChat, setActiveChatBackgroundUrl, setActiveChatTheme } =
    useChatStore((state) => state);

  /* ---------------------------------------------------------
     1️⃣  Derive selectedChatId *before* we create callbacks
  --------------------------------------------------------- */
  const selectedChatId = useMemo(() => {
    if (!pathname) return null;
    const match = pathname.match(/^\/chat\/([^/]+)$/);
    return match ? match[1] : null;
  }, [pathname]);

  /* ---------------------------------------------------------
     2️⃣  Main "open chat" handler
  --------------------------------------------------------- */
  const handleOpenChat = useCallback(
    ({
      chatId,
      refresh = false,
      backgroundUrl,
      searchParams,
      themeId,
    }: OpenChatArgs) => {
      // always close mobile sidebar
      setOpenMobile(false);

      /* ✅ skip only if *already* on the same chat & no refresh requested */
      if (!refresh && chatId === selectedChatId) {
        return;
      }

      // clear store state from previous chat
      resetActiveChat();

      let href = `/chat/${chatId}`;
      searchParams && (href += searchParams);

      if (refresh) {
        // force full reload
        window.location.href = href;
      } else {
        // preload bg image for smoother transition
        setActiveChatBackgroundUrl(backgroundUrl || "");

        themeId && setActiveChatTheme(themeId);

        // SPA navigation
        router.push(href);
      }
    },
    [
      selectedChatId, // 🔥 include so closure updates when URL changes
      setOpenMobile,
      resetActiveChat,
      setActiveChatBackgroundUrl,
      router,
    ]
  );

  /* ---------------------------------------------------------
     3️⃣  Manual reset helper
  --------------------------------------------------------- */
  const handleResetActiveChat = useCallback(
    ({ path }: { path?: string }) => {
      resetActiveChat();
      if (path) {
        router.push(path);
      }
    },
    [resetActiveChat, router]
  );

  /* ---------------------------------------------------------
     4️⃣  Return helpers to caller
  --------------------------------------------------------- */
  return {
    handleOpenChat,
    handleResetActiveChat,
    selectedChatId,
  };
}
