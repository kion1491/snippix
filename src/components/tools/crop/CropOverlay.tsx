"use client";

import { useEffect, useRef } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useEditorStore } from "@/store/editor-store";
import { useFitSize } from "@/hooks/useFitSize";

export function CropOverlay() {
  const current = useEditorStore((s) => s.current);
  const cropRegion = useEditorStore((s) => s.cropRegion);
  const cropAspect = useEditorStore((s) => s.cropAspect);
  const setCropRegion = useEditorStore((s) => s.setCropRegion);

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fitSize = useFitSize(containerRef, current?.meta ?? null);

  // 비율 변경 시 영역을 새 비율로 초기화 (가운데 80%)
  useEffect(() => {
    if (!current) return;
    const { width: iw, height: ih } = current.meta;

    if (cropAspect) {
      const c = centerCrop(
        makeAspectCrop({ unit: "%", width: 80 }, cropAspect, iw, ih),
        iw,
        ih
      );
      setCropRegion({
        x: (c.x / 100) * iw,
        y: (c.y / 100) * ih,
        width: (c.width / 100) * iw,
        height: (c.height / 100) * ih,
      });
    } else if (!cropRegion) {
      setCropRegion({
        x: iw * 0.1,
        y: ih * 0.1,
        width: iw * 0.8,
        height: ih * 0.8,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.src, cropAspect]);

  if (!current) return null;

  const { width: iw, height: ih } = current.meta;

  const percentCrop: Crop | undefined = cropRegion
    ? {
        unit: "%",
        x: (cropRegion.x / iw) * 100,
        y: (cropRegion.y / ih) * 100,
        width: (cropRegion.width / iw) * 100,
        height: (cropRegion.height / ih) * 100,
      }
    : undefined;

  const handleChange = (_: Crop, percent: Crop) => {
    setCropRegion({
      x: (percent.x / 100) * iw,
      y: (percent.y / 100) * ih,
      width: (percent.width / 100) * iw,
      height: (percent.height / 100) * ih,
    });
  };

  // containerRef가 항상 마운트되어야 fitSize ResizeObserver가 동작함
  // cropRegion은 마운트 후 useEffect에서 비동기로 설정되므로 컨테이너를 조건 없이 렌더
  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center w-full h-full min-h-0 overflow-hidden"
    >
      {fitSize && cropRegion && percentCrop && (
        <ReactCrop
          crop={percentCrop}
          onChange={handleChange}
          aspect={cropAspect}
          keepSelection
          ruleOfThirds
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={current.src}
            alt="자르기 대상 이미지"
            className="block"
            style={{ width: fitSize.w, height: fitSize.h }}
          />
        </ReactCrop>
      )}
    </div>
  );
}
