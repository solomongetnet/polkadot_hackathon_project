import React, { ReactNode, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { chatThemes, getSelectedChatTheme } from "@/constants/themes";
import { useAuthStore } from "@/store/auth-store";
import { useErrorToast } from "@/hooks/use-error-toast";
import { useCustomizeChatThemeMutation } from "@/hooks/api/use-chat";
import { toast } from "sonner";
import { useChatStore } from "@/store";
import { ANIMATED_GIFS, BACKGROUND_IMAGES } from "@/assets/assets";

const ThemeModal = ({ children }: { children: ReactNode }) => {
  const chatStore = useChatStore();
  const [isOpen, setIsOpen] = useState(false);
  const errorToast = useErrorToast();
  const { currentUser } = useAuthStore();
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(
    chatStore.activeChatTheme?.id || null
  );
  const [selectedWallpaper, setSelectedWallpaper] = useState<string | null>(
    chatStore.activeChatBackgroundUrl || null
  );
  const selectedTheme = useMemo(() => {
    return getSelectedChatTheme(selectedThemeId);
  }, [selectedThemeId]);
  const customizeChatThemeMutation = useCustomizeChatThemeMutation();

  const [_, setSelectedWallpaperTab] = useState<"images" | "gifs">("images");

  const [showWallpaperView, setShowWallpaperView] = useState(false);

  const handleSelectWallpaper = (src: string) => {
    setSelectedWallpaper(src);
    setShowWallpaperView(false);
  };

  const handleThemeColorChange = (themeId: string) => {
    setSelectedThemeId(themeId);
  };

  const handleRemoveSelectedWallpaper = () => {
    setSelectedWallpaper("");
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleApplyChange = async () => {
    if (currentUser.user?.plan.toLowerCase() === "free") {
      errorToast.showErrorToast({
        code: "PLUS_REQUIRED",
      });

      return;
    }

    if (!selectedThemeId && !selectedWallpaper) {
      toast.error("Please make some change!");
      return;
    }

    const { success, updatedData } =
      await customizeChatThemeMutation.mutateAsync({
        backgroundUrl: selectedWallpaper || "",
        themeId: selectedThemeId || "",
        chatId: chatStore.selectedChatId()! || chatStore.activeChatData?.id!,
      });

    if (success && updatedData) {
      selectedWallpaper &&
        chatStore.setActiveChatBackgroundUrl(updatedData?.backgroundUrl || "");
      selectedThemeId &&
        chatStore.setActiveChatTheme(updatedData?.themeId || "");
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      {showWallpaperView ? (
        <DialogContent
          className="h-[90dvh] flex flex-col sm:h-[80dvh] max-sm:min-w-[80%] sm:w-[450px] rounded-2xl bg-muted"
          showCloseButton={false}
        >
          <header className="pb-4 w-full flex justify-between items-center h-fit">
            <Button
              className=""
              variant={"ghost"}
              size={"icon"}
              onClick={() => {
                setShowWallpaperView(false);
              }}
            >
              <ChevronLeft />
            </Button>

            <span className="text-sm">Select Wallpaper</span>

            <span onClick={handleClose}>
              <X className="w-5" />
            </span>
          </header>

          <Tabs
            defaultValue="images"
            onValueChange={(value) =>
              setSelectedWallpaperTab(value as "images" | "gifs")
            }
            className="flex-1 overflow-y-scroll"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="gifs">GIFs</TabsTrigger>
            </TabsList>
            <TabsContent value="images">
              <div className="grid grid-cols-3 gap-2 max-h-[50dvh] overflow-y-auto pr-2">
                {BACKGROUND_IMAGES.map((src, index) => (
                  <div
                    key={index}
                    className={`w-full aspect-video overflow-hidden rounded-sm cursor-pointer border border-transparent hover:border-primary transition-colors ${
                      selectedWallpaper == src && "border-2"
                    }`}
                    onClick={() => handleSelectWallpaper(src)}
                  >
                    <img
                      className="w-full h-full object-cover"
                      alt={`Static image ${index + 1}`}
                      src={src || "/placeholder.svg"}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="gifs">
              <div className="grid grid-cols-3 gap-2 max-h-[50dvh] overflow-y-auto pr-2">
                {ANIMATED_GIFS.map((src, index) => (
                  <div
                    key={index}
                    className={`w-full aspect-video overflow-hidden rounded-sm cursor-pointer border border-transparent hover:border-primary transition-colors ${
                      selectedWallpaper == src && "border-2"
                    }`}
                    onClick={() => handleSelectWallpaper(src)}
                  >
                    <img
                      className="w-full h-full object-cover"
                      alt={`Animated GIF ${index + 1}`}
                      src={src || "/placeholder.svg"}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      ) : (
        <DialogContent
          className="h-[90dvh] sm:h-[80dvh] max-sm:min-w-[80%] sm:w-[450px] rounded-2xl bg-muted"
          showCloseButton={false}
        >
          {/* Color Grid - Exact layout from screenshot */}
          <div className="flex flex-col gap-3">
            <header className="w-full flex justify-between pb-4 items-center">
              <div />
              <h2 className="">
                <span className="text-muted-foreground">Available on</span>{" "}
                <span className="font-semibold"> Charapia+</span>{" "}
              </h2>

              <span onClick={handleClose}>
                <X className="w-5" />
              </span>
            </header>

            {/* preview  */}
            <div className="overflow-hidden relative p-4 flex-1 rounded-xl backdrop-blur-3xl bg-white/10 flex">
              {/* assisitant view */}
              <div className="z-4 flex-1 flex w-full flex-col gap-2 justify-center">
                <div
                  className={`relative self-start flex flex-col w-[230px] h-[45px] rounded-lg opacity-90 `}
                  style={{ backgroundColor: selectedTheme.aiColorHex }}
                >
                  <span
                    className="w-[60%] h-[10px] rounded-2xl absolute top-2 left-2 opacity-50"
                    style={{ background: selectedTheme.aiTextColorHex }}
                  ></span>
                </div>
                <div
                  className={`relative self-end flex flex-col w-[230px] h-[45px] rounded-lg opacity-90 `}
                  style={{ backgroundColor: selectedTheme.userColorHex }}
                >
                  <span
                    className="w-[60%] h-[10px] rounded-2xl absolute bottom-2 right-2 opacity-50"
                    style={{ background: selectedTheme.userTextColorHex }}
                  ></span>
                </div>
              </div>

              {selectedWallpaper && (
                <img
                  className="absolute inset-0 min-w-full min-h-full max-w-full max-h-full object-cover border-0 outline-0"
                  src={selectedWallpaper || ""}
                />
              )}
            </div>

            {/* wallapaper */}
            <div className="w-full flex justify-between items-center rounded-2xl border-2 py-3 px-3 ">
              <h2 className="text-sm">Wallpaper</h2>
              <div className="flex gap-2">
                {selectedWallpaper && (
                  <Button
                    className="rounded-full"
                    variant={"ghost"}
                    onClick={() => handleRemoveSelectedWallpaper()}
                  >
                    Remove
                  </Button>
                )}
                <Button
                  className="rounded-full px-4"
                  onClick={() => setShowWallpaperView(true)}
                >
                  {selectedWallpaper ? "Change " : "Select "}
                </Button>
              </div>
            </div>

            {/* theme selector and apply action */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2 p-3 rounded-xl border">
                <header className="text-sm flex justify-between items-center">
                  <span>Chat color</span>
                  {selectedTheme.isDefault && (
                    <span className="text-xs opacity-60">Default</span>
                  )}
                </header>

                <div className="grid grid-cols-5 gap-3">
                  {chatThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeColorChange(theme.id)}
                      className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-105 ${
                        selectedThemeId === theme.id
                          ? "ring-2 ring-blue-400 border-white"
                          : "border-gray-600 hover:border-gray-400"
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${theme.userColorHex} 50%, ${theme.aiColorHex} 50%)`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="w-full" onClick={handleApplyChange}>
                <Button
                  className="w-full rounded-full py-5"
                  disabled={customizeChatThemeMutation.isPending}
                >
                  {customizeChatThemeMutation.isPending
                    ? "Pending...."
                    : " Apply change"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default ThemeModal;
