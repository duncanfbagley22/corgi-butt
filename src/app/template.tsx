"use client";

import { usePathname } from "next/navigation";
import { useNavigation } from "./contexts/NavigationContext";
import { useEffect } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { resetTransition } = useNavigation();


  // Reset transition after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      resetTransition();
    }, 500); // Match this to your animation duration

    return () => clearTimeout(timer);
  }, [pathname, resetTransition]);

  return (
        {children}

  );
}