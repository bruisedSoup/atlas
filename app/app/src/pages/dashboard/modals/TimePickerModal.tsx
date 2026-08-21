"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTime: string; // "18:00" (24h format)
  onSelectTime: (timeStr: string) => void;
}

const ITEM_HEIGHT = 44; // height of each drum item in px
const VISIBLE_COUNT = 5; // 5 visible rows, middle is index 2

interface WheelColumnProps<T> {
  items: T[];
  selectedItem: T;
  onSelect: (item: T) => void;
  renderItem?: (item: T) => React.ReactNode;
  width?: string;
  loop?: boolean;
}

function WheelColumn<T extends string | number>({
  items,
  selectedItem,
  onSelect,
  renderItem,
  width = "72px",
  loop = true,
}: WheelColumnProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScrollTop = useRef(0);
  const hasMoved = useRef(false);
  const isUserScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const N = items.length;
  // Repetition multiplier for infinite loop
  const K = loop ? (N <= 2 ? 15 : N <= 12 ? 9 : 7) : 1;
  const middleSet = Math.floor(K / 2);
  const cycleHeight = N * ITEM_HEIGHT;

  const repeatedItems = React.useMemo(() => {
    if (!loop) return items;
    const arr: T[] = [];
    for (let i = 0; i < K; i++) {
      for (let j = 0; j < N; j++) {
        arr.push(items[j]);
      }
    }
    return arr;
  }, [items, loop, K, N]);

  const selectedIndex = items.indexOf(selectedItem);
  const [activeRawIndex, setActiveRawIndex] = useState<number>(() => {
    const idx = selectedIndex >= 0 ? selectedIndex : 0;
    return loop ? middleSet * N + idx : idx;
  });

  // Scroll to selected position
  const scrollToRawIndex = useCallback(
    (targetRawIndex: number, smooth = true) => {
      if (containerRef.current && targetRawIndex >= 0) {
        const top = targetRawIndex * ITEM_HEIGHT;
        containerRef.current.scrollTo({
          top,
          behavior: smooth ? "smooth" : "auto",
        });
        setActiveRawIndex(targetRawIndex);
      }
    },
    []
  );

  // Initial scroll position on mount
  useEffect(() => {
    if (containerRef.current && selectedIndex >= 0) {
      const targetIndex = loop ? middleSet * N + selectedIndex : selectedIndex;
      containerRef.current.scrollTop = targetIndex * ITEM_HEIGHT;
      setActiveRawIndex(targetIndex);
    }
  }, []);

  // When selectedItem changes externally
  useEffect(() => {
    if (!isUserScrolling.current && !isDragging.current && selectedIndex >= 0) {
      if (loop) {
        const currentNorm = ((activeRawIndex % N) + N) % N;
        if (currentNorm !== selectedIndex) {
          const targetIndex = middleSet * N + selectedIndex;
          scrollToRawIndex(targetIndex, false);
        }
      } else {
        scrollToRawIndex(selectedIndex, false);
      }
    }
  }, [selectedIndex, loop, middleSet, N, scrollToRawIndex, activeRawIndex]);

  // Snap to nearest item after scroll finishes
  const snapToNearest = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const rawIndex = Math.round(scrollTop / ITEM_HEIGHT);
    const normalizedIndex = ((rawIndex % N) + N) % N;

    if (loop) {
      const targetTop = rawIndex * ITEM_HEIGHT;
      containerRef.current.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });
      setActiveRawIndex(rawIndex);
    } else {
      const clampedIndex = Math.max(0, Math.min(rawIndex, N - 1));
      containerRef.current.scrollTo({
        top: clampedIndex * ITEM_HEIGHT,
        behavior: "smooth",
      });
      setActiveRawIndex(clampedIndex);
    }

    const newItem = items[normalizedIndex];
    if (newItem !== selectedItem) {
      onSelect(newItem);
    }
  }, [N, items, loop, onSelect, selectedItem]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const raw = Math.round(scrollTop / ITEM_HEIGHT);
    setActiveRawIndex(raw);

    // Infinite loop wrap-around
    if (loop) {
      const minThreshold = 1.5 * cycleHeight;
      const maxThreshold = (K - 2.5) * cycleHeight;
      const shiftCycles = Math.floor(K / 2);
      const shiftPx = shiftCycles * cycleHeight;

      if (scrollTop < minThreshold) {
        containerRef.current.scrollTop += shiftPx;
        if (isDragging.current) {
          startScrollTop.current += shiftPx;
        }
      } else if (scrollTop > maxThreshold) {
        containerRef.current.scrollTop -= shiftPx;
        if (isDragging.current) {
          startScrollTop.current -= shiftPx;
        }
      }
    }

    isUserScrolling.current = true;
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

    scrollTimeout.current = setTimeout(() => {
      snapToNearest();
      isUserScrolling.current = false;
    }, 100);
  };

  // Pointer Drag Support (Mouse click & drag + Touch drag)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    hasMoved.current = false;
    startY.current = e.clientY;
    if (containerRef.current) {
      startScrollTop.current = containerRef.current.scrollTop;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !containerRef.current) return;
    const deltaY = e.clientY - startY.current;
    if (Math.abs(deltaY) > 3) {
      hasMoved.current = true;
    }
    containerRef.current.scrollTop = startScrollTop.current - deltaY;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    snapToNearest();
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    snapToNearest();
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      style={{
        width,
        height: `${ITEM_HEIGHT * VISIBLE_COUNT}px`,
        overflowY: "auto",
        scrollSnapType: "y mandatory",
        position: "relative",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        touchAction: "none",
        cursor: "grab",
      }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Top Padding so first item can reach center */}
      <div style={{ height: `${ITEM_HEIGHT * 2}px`, pointerEvents: "none" }} />

      {repeatedItems.map((item, idx) => {
        const diff = Math.abs(idx - activeRawIndex);
        const isCentered = diff === 0;
        const opacity = isCentered ? 1 : diff === 1 ? 0.5 : 0.25;
        const scale = isCentered ? 1.05 : 0.9;

        return (
          <div
            key={`${String(item)}-${idx}`}
            onClick={() => {
              if (!hasMoved.current) {
                const normalizedIndex = ((idx % N) + N) % N;
                onSelect(items[normalizedIndex]);
                scrollToRawIndex(idx, true);
              }
            }}
            style={{
              height: `${ITEM_HEIGHT}px`,
              scrollSnapAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'EB Garamond', Georgia, serif",
              fontSize: isCentered ? "1.65rem" : "1.25rem",
              fontWeight: isCentered ? 600 : 400,
              color: isCentered ? "#111827" : "#6b7280",
              opacity,
              transform: `scale(${scale})`,
              transition: "opacity 0.15s ease, transform 0.15s ease, color 0.15s ease",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            {renderItem ? renderItem(item) : item}
          </div>
        );
      })}

      {/* Bottom Padding so last item can reach center */}
      <div style={{ height: `${ITEM_HEIGHT * 2}px`, pointerEvents: "none" }} />
    </div>
  );
}

export function TimePickerModal({
  isOpen,
  onClose,
  selectedTime = "",
  onSelectTime,
}: TimePickerModalProps) {
  // Parse initial 24h time to 12h + AM/PM (defaults to current time)
  const parseTime = (t?: string) => {
    let h: number;
    let m: string;
    if (!t) {
      const now = new Date();
      h = now.getHours();
      m = String(now.getMinutes()).padStart(2, "0");
    } else {
      const [hStr, mStr] = t.split(":");
      h = parseInt(hStr, 10);
      m = String(mStr || "00").padStart(2, "0");
    }
    const p = h >= 12 ? "PM" : "AM";
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return { hour: h, minute: m, period: p };
  };

  const parsed = parseTime(selectedTime);
  const [selectedHour, setSelectedHour] = useState(parsed.hour);
  const [selectedMinute, setSelectedMinute] = useState(parsed.minute);
  const [selectedPeriod, setSelectedPeriod] = useState(parsed.period);

  useEffect(() => {
    if (isOpen) {
      const p = parseTime(selectedTime);
      setSelectedHour(p.hour);
      setSelectedMinute(p.minute);
      setSelectedPeriod(p.period);
    }
  }, [isOpen, selectedTime]);

  if (!isOpen) return null;

  const hours = Array.from({ length: 12 }, (_, i) => i + 1); // 1 to 12
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")); // "00" to "59"
  const periods = ["AM", "PM"];

  const handleConfirm = () => {
    let h = selectedHour;
    if (selectedPeriod === "PM" && h < 12) h += 12;
    if (selectedPeriod === "AM" && h === 12) h = 0;
    const formatted = `${String(h).padStart(2, "0")}:${selectedMinute}`;
    onSelectTime(formatted);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 150,
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "340px",
          backgroundColor: "#ffffff",
          borderRadius: "18px",
          padding: "24px 20px 22px",
          boxShadow: "0 20px 35px rgba(0,0,0,0.15)",
          border: "1.5px solid #374151",
          fontFamily: "'Inter', sans-serif",
          position: "relative",
        }}
      >
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          <h3
            style={{
              fontFamily: "'EB Garamond', Georgia, serif",
              fontSize: "1.45rem",
              fontWeight: 600,
              fontStyle: "italic",
              color: "#111827",
              margin: 0,
            }}
          >
            Set Time
          </h3>
        </div>

        {/* 3-Column Drum Wheel Container */}
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "14px",
            margin: "12px 0 20px",
            overflow: "hidden",
            userSelect: "none",
          }}
        >
          {/* Central Highlight Selection Bar behind the items */}
          <div
            style={{
              position: "absolute",
              top: `${ITEM_HEIGHT * 2}px`,
              left: "10px",
              right: "10px",
              height: `${ITEM_HEIGHT}px`,
              backgroundColor: "#f4f4f5",
              borderRadius: "10px",
              border: "1.5px solid #e4e4e7",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          {/* Column 1: Hour */}
          <div style={{ zIndex: 1 }}>
            <WheelColumn
              items={hours}
              selectedItem={selectedHour}
              onSelect={setSelectedHour}
              width="64px"
            />
          </div>

          {/* Separator Colon */}
          <span
            style={{
              fontFamily: "'EB Garamond', Georgia, serif",
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "#111827",
              zIndex: 1,
              marginTop: "-4px",
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            :
          </span>

          {/* Column 2: Minute */}
          <div style={{ zIndex: 1 }}>
            <WheelColumn
              items={minutes}
              selectedItem={selectedMinute}
              onSelect={setSelectedMinute}
              width="64px"
            />
          </div>

          {/* Column 3: AM/PM */}
          <div style={{ zIndex: 1 }}>
            <WheelColumn
              items={periods}
              selectedItem={selectedPeriod}
              onSelect={setSelectedPeriod}
              width="68px"
              loop={false}
            />
          </div>

          {/* Top Fade Gradient Overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: `${ITEM_HEIGHT * 1.6}px`,
              background: "linear-gradient(to bottom, rgba(255,255,255,0.95) 20%, rgba(255,255,255,0))",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />

          {/* Bottom Fade Gradient Overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: `${ITEM_HEIGHT * 1.6}px`,
              background: "linear-gradient(to top, rgba(255,255,255,0.95) 20%, rgba(255,255,255,0))",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              height: "40px",
              borderRadius: "8px",
              background: "#ffffff",
              border: "1.5px solid #4b5563",
              color: "#374151",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            style={{
              height: "40px",
              borderRadius: "8px",
              background: "#111827",
              border: "1.5px solid #111827",
              color: "#ffffff",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            Set Time
          </button>
        </div>
      </div>
    </div>
  );
}
