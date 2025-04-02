import { useEffect, useState } from "react";

export const useScrollVisibility = (enabled: boolean, scrollThreshold = 50) => {
  const [isVisible, setIsVisible] = useState(!enabled);

  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      if (window.scrollY > scrollThreshold) {
        setIsVisible(true);
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [enabled, scrollThreshold]);

  return isVisible;
};
