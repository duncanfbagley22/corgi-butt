"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useNavigation } from "./contexts/NavigationContext";
import { useEffect } from "react";
import { theme } from '../../config/theme'

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { transitionType, direction, clickPosition, resetTransition } = useNavigation();

  console.log('Template clickPosition:', clickPosition);

  // Reset transition after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      resetTransition();
    }, 500); // Match this to your animation duration

    return () => clearTimeout(timer);
  }, [pathname, resetTransition]);

  // Zoom animation variants (like iPhone app opening)
  const zoomVariants = {
    initial: {
      scale: direction === "forward" ? 0.8 : 1.1,
      opacity: 0,
    },
    animate: {
      scale: 1,
      opacity: 1,
    },
    exit: {
      scale: direction === "forward" ? 1.1 : 0.8,
      opacity: 0,
    },
  };

  // Fade animation variants
  const fadeVariants = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
  };

  // Slide animation variants
  const slideVariants = {
    initial: {
      x: direction === "forward" ? "100%" : "-100%",
      opacity: 0,
    },
    animate: {
      x: 0,
      opacity: 1,
    },
    exit: {
      x: direction === "forward" ? "-100%" : "100%",
      opacity: 0,
    },
  };

  // Choose the right variant based on transition type
  const getVariants = () => {
    switch (transitionType) {
      case "zoom":
        return zoomVariants;
      case "fade":
        return fadeVariants;
      case "slide":
        return slideVariants;
      default:
        return fadeVariants; // Default fallback
    }
  };

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={getVariants()}
        transition={{
          duration: .5,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          backgroundColor: theme.colors.background,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "translateZ(0)",
          WebkitFontSmoothing: "antialiased",
          overflow: "hidden",
          transformOrigin: clickPosition 
            ? `${clickPosition.x}px ${clickPosition.y}px`
            : 'center center',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}