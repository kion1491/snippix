"use client";

import { useRef } from "react";
import { useEditorStore } from "@/store/editor-store";
import { useFitSize } from "@/hooks/useFitSize";

export function SliceOverlay() {
  const current = useEditorStore((s) => s.current);
  const sliceRows = useEditorStore((s) => s.sliceRows);
  const sliceCols = useEditorStore((s) => s.sliceCols);

  const containerRef = useRef<HTMLDivElement>(null);
  const fitSize = useFitSize(containerRef, current?.meta ?? null);

  if (!current) return null;

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center w-full h-full min-h-0 overflow-hidden"
    >
      {fitSize && (
        <div
          className="relative shadow-md"
          style={{ width: fitSize.w, height: fitSize.h }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.src}
            alt="슬라이스 대상 이미지"
            className="block w-full h-full select-none"
            draggable={false}
          />
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 ${fitSize.w} ${fitSize.h}`}
            preserveAspectRatio="none"
          >
            {/* 가로 분할선 (rows-1 개) */}
            {Array.from({ length: Math.max(0, sliceRows - 1) }).map((_, i) => {
              const y = ((i + 1) / sliceRows) * fitSize.h;
              return (
                <g key={`h-${i}`}>
                  <line
                    x1={0}
                    y1={y}
                    x2={fitSize.w}
                    y2={y}
                    stroke="black"
                    strokeOpacity={0.6}
                    strokeWidth={3}
                  />
                  <line
                    x1={0}
                    y1={y}
                    x2={fitSize.w}
                    y2={y}
                    stroke="white"
                    strokeWidth={1}
                    strokeDasharray="6 4"
                  />
                </g>
              );
            })}
            {/* 세로 분할선 (cols-1 개) */}
            {Array.from({ length: Math.max(0, sliceCols - 1) }).map((_, i) => {
              const x = ((i + 1) / sliceCols) * fitSize.w;
              return (
                <g key={`v-${i}`}>
                  <line
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={fitSize.h}
                    stroke="black"
                    strokeOpacity={0.6}
                    strokeWidth={3}
                  />
                  <line
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={fitSize.h}
                    stroke="white"
                    strokeWidth={1}
                    strokeDasharray="6 4"
                  />
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}
