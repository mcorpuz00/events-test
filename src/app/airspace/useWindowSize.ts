"use client";

import { useState, useEffect } from "react";

interface WindowSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export default function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({
    width: 1440,
    height: 900,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setSize({
        width: w,
        height: h,
        isMobile: w < 768,
        isTablet: w >= 768 && w < 1440,
        isDesktop: w >= 1440,
      });
    }
    update();
    let timeout: ReturnType<typeof setTimeout>;
    function handleResize() {
      clearTimeout(timeout);
      timeout = setTimeout(update, 100);
    }
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return size;
}
