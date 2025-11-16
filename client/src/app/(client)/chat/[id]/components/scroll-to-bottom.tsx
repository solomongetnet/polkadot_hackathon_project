import { scrollToBottom } from "@/helper/scroll";
import { ChevronDown } from "lucide-react";
import React, { useEffect, useState } from "react";

const ScrollToBottom = () => {
  const [showScrollDown, setShowScrollDown] = useState(true);

  // Handle scroll position
  const handleScroll = () => {
    const el = document.getElementById("conversation-container");
    if (!el) return;

    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 150;
    setShowScrollDown(!atBottom);
  };

  const handleScrollToBottom = () => {
    scrollToBottom({
      elementId: "conversation-container",
      behavior: "smooth",
      shouldScroll: true,
    });
  };

  useEffect(() => {
    const el = document.getElementById("conversation-container");
    if (!el) return;

    handleScroll(); // initial check
    el.addEventListener("scroll", handleScroll);

    // cleanup
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  if (showScrollDown) {
    return (
      <span
        className="z-20 mx-auto absolute -left-[50%] -right-[50%] translate-x-[50%] bottom-28 md:bottom-32 bg-white dark:bg-black w-[40px] h-[40px] rounded-full grid place-content-center cursor-pointer"
        onClick={handleScrollToBottom}
      >
        <ChevronDown />
      </span>
    );
  }
};

export default ScrollToBottom;
