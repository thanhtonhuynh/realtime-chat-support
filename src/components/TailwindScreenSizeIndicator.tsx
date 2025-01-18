"use client";

import { useEffect, useState } from "react";

export function TailwindScreenSizeIndicator() {
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex h-7 w-fit items-center justify-center gap-1 rounded-full bg-transparent px-2 py-1 font-geist-mono text-xs font-bold text-muted-foreground shadow-[0_0_10px_0_rgba(0,0,0,0.3)]">
      <div className="block sm:hidden">XS</div>
      <div className="hidden sm:block md:hidden">SM</div>
      <div className="hidden md:block lg:hidden">MD</div>
      <div className="hidden lg:block xl:hidden">LG</div>
      <div className="hidden xl:block 2xl:hidden">XL</div>
      <div className="hidden 2xl:block">2XL</div>

      <span className="text-xs font-normal">
        {size.width}px x {size.height}px
      </span>
    </div>
  );
}
