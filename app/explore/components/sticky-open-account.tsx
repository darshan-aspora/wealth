"use client";

import { useState, useEffect } from "react";

export function StickyOpenAccount() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const target = document.getElementById("hero-cta");
    const scrollContainer = target?.closest("main");
    if (!target || !scrollContainer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting),
      { root: scrollContainer, threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (!show) return null;

  return (
    <div className="sticky bottom-0 z-30 px-5 py-3 pointer-events-none">
      <button className="bg-foreground text-background h-[44px] rounded-md font-semibold text-[14px] w-full shadow-lg pointer-events-auto transition-opacity active:opacity-80">
        Open Free Account
      </button>
    </div>
  );
}
