"use client";

import { useEditorStore } from "@/store/editor-store";
import { ImageIcon } from "lucide-react";
import { formatBytes } from "@/lib/image/formats";
import { CropOptions } from "@/components/tools/crop/CropOptions";
import { SliceOptions } from "@/components/tools/slice/SliceOptions";
import { ResizeOptions } from "@/components/tools/resize/ResizeOptions";
import { RotateOptions } from "@/components/tools/rotate/RotateOptions";

export function OptionsPanel() {
  const current = useEditorStore((s) => s.current);
  const activeTool = useEditorStore((s) => s.activeTool);

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
        <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          이미지를 불러오면<br />편집 옵션이 표시됩니다
        </p>
      </div>
    );
  }

  if (activeTool === "crop") {
    return <CropOptions />;
  }

  if (activeTool === "slice") {
    return <SliceOptions />;
  }

  if (activeTool === "resize") {
    return <ResizeOptions />;
  }

  if (activeTool === "rotate") {
    return <RotateOptions />;
  }

  // 도구 미선택: 이미지 정보 표시
  const { width, height, bytes, mime, name } = current.meta;
  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          이미지 정보
        </h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground shrink-0">파일명</dt>
            <dd className="font-mono text-right truncate max-w-[160px]" title={name}>{name}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground shrink-0">크기</dt>
            <dd className="font-mono">{width} × {height}px</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground shrink-0">용량</dt>
            <dd className="font-mono">{formatBytes(bytes)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground shrink-0">형식</dt>
            <dd className="font-mono">{mime}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-auto">
        <p className="text-xs text-muted-foreground text-center">
          상단 탭에서 편집 도구를 선택하세요
        </p>
      </div>
    </div>
  );
}
