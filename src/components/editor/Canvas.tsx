"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "@/store/editor-store";
import { Loader2 } from "lucide-react";

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = useEditorStore((s) => s.current);
  const status = useEditorStore((s) => s.status);

  useEffect(() => {
    if (!current || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    let cancelled = false;

    const draw = () => {
      if (cancelled || !img.complete || img.naturalWidth === 0) return;
      const dpr = window.devicePixelRatio || 1;
      const { width: cw, height: ch } = container.getBoundingClientRect();
      const { width: iw, height: ih } = current.meta;

      const scale = Math.min(cw / iw, ch / ih, 1);
      const drawW = Math.round(iw * scale);
      const drawH = Math.round(ih * scale);

      canvas.width = drawW * dpr;
      canvas.height = drawH * dpr;
      canvas.style.width = `${drawW}px`;
      canvas.style.height = `${drawH}px`;
      ctx.scale(dpr, dpr);
      ctx.drawImage(img, 0, 0, drawW, drawH);
    };

    img.onload = draw;
    img.src = current.src;

    const ro = new ResizeObserver(draw);
    ro.observe(container);

    return () => { cancelled = true; ro.disconnect(); };
  }, [current]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full h-full"
    >
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}
      {current && (
        <canvas
          ref={canvasRef}
          className="rounded shadow-md max-w-full max-h-full"
        />
      )}
    </div>
  );
}
