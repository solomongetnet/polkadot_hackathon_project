import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState } from "react";

export default function AnimatedGif({ currentGif }: { currentGif: string }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Motion values for X and Y
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Transform values for subtle rotation and movement based on mouse
  const rotateX = useTransform(mouseY, [-100, 100], [15, -15]);
  const rotateY = useTransform(mouseX, [-100, 100], [-15, 15]);
  const translateX = useTransform(mouseX, [-100, 100], [-20, 20]);
  const translateY = useTransform(mouseY, [-100, 100], [-20, 20]);

  // Mouse move handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2; // center as 0
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <motion.div
      className="aspect-video h-[100dvh] max-md:-[100w] md:h-[80dvh] md:rounded-3xl object-cover  perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        mouseX.set(0);
        mouseY.set(0);
      }}
      style={{
        perspective: 1000,
      }}
    >
      <motion.img
        src={currentGif || "/placeholder.svg"}
        className="aspect-video h-[100dvh] max-md:w-[100vw] md:h-[80dvh] md:rounded-3xl object-cover border-primary  shadow-primary border-primary border-4 shadow-primary"
        alt="Anime cover"
        onLoad={() => setIsImageLoaded(true)}
        style={{
          opacity: isImageLoaded ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
          rotateX: rotateX,
          rotateY: rotateY,
          x: translateX,
          y: translateY,
        }}
        animate={{
          y:
            typeof window !== "undefined" && window.innerWidth >= 768
              ? [0, -5, 0]
              : 0,
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1.5,
        }}
      />
    </motion.div>
  );
}
