"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface DragSliderProps {
  beforeContent: React.ReactNode;
  afterContent: React.ReactNode;
}

export default function DragSlider({ beforeContent, afterContent }: DragSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setPosition(pct);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-surface-light cursor-col-resize select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setDragging(false)}
    >
      {/* After (full width behind) */}
      <div className="absolute inset-0">
        {afterContent}
      </div>

      {/* Before (clipped) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        {beforeContent}
      </div>

      {/* Divider handle */}
      <motion.div
        className="absolute top-0 bottom-0 w-1 bg-accent cursor-col-resize z-10"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        onMouseDown={() => setDragging(true)}
        onTouchStart={() => setDragging(true)}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-accent border-2 border-white/20 flex items-center justify-center shadow-lg">
          <span className="text-white text-xs font-bold">&harr;</span>
        </div>
      </motion.div>

      {/* Labels */}
      <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-rose/20 text-rose text-xs font-semibold z-20">
        Before
      </div>
      <div className="absolute top-4 right-4 px-3 py-1 rounded-lg bg-emerald/20 text-emerald text-xs font-semibold z-20">
        After
      </div>
    </div>
  );
}
