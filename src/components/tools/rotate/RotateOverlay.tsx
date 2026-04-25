"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/store/editor-store";

export function RotateOverlay() {
  const current = useEditorStore((s) => s.current);
  const angle = useEditorStore((s) => s.rotateAngle);
  const flipH = useEditorStore((s) => s.rotateFlipH);
  const flipV = useEditorStore((s) => s.rotateFlipV);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const compute = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) setContainerSize({ w: width, h: height });
    };
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    compute();
    return () => ro.disconnect();
  }, []);

  if (!current) return null;

  const { width: iw, height: ih } = current.meta;

  // 회전 후 바운딩 박스에 맞춰 표시 크기 계산
  let displayW = iw;
  let displayH = ih;
  if (containerSize) {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    const bbW = iw * cos + ih * sin;
    const bbH = iw * sin + ih * cos;
    const scale = Math.min(containerSize.w / bbW, containerSize.h / bbH, 1);
    displayW = Math.round(iw * scale);
    displayH = Math.round(ih * scale);
  }

  const transformParts = [`rotate(${angle}deg)`];
  if (flipH) transformParts.push("scaleX(-1)");
  if (flipV) transformParts.push("scaleY(-1)");
  const transform = transformParts.join(" ");
  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center w-full h-full min-h-0 overflow-hidden"
    >
      {containerSize && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={current.src}
          alt="회전/반전 미리보기"
          draggable={false}
          style={{
            width: displayW,
            height: displayH,
            transform,
            transition: "transform 0.12s ease",
          }}
        />
      )}
    </div>
  );
}
