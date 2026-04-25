"use client";

import { useState } from "react";
import { ChevronDown, Download, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEditorStore } from "@/store/editor-store";
import {
  EXPORT_FORMATS,
  formatBytes,
  getExportFormatDef,
  type ExportFormat,
} from "@/lib/image/formats";
import { downloadAs } from "@/lib/image/export";
import { toast } from "sonner";

export function StatusBar() {
  const original = useEditorStore((s) => s.original);
  const current = useEditorStore((s) => s.current);
  const status = useEditorStore((s) => s.status);
  const clear = useEditorStore((s) => s.clear);
  const revertToOriginal = useEditorStore((s) => s.revertToOriginal);

  const [format, setFormat] = useState<ExportFormat>("png");
  const [downloading, setDownloading] = useState(false);

  const isReady = status === "ready" && current;
  const hasEdits = isReady && original && current !== original;
  const formatDef = getExportFormatDef(format);

  const handleDownload = async () => {
    if (!current) return;
    setDownloading(true);
    try {
      await downloadAs(current.src, format, current.meta.name);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 px-4 h-11 border-t border-border bg-background shrink-0 text-sm">
      <div className="text-muted-foreground text-xs truncate">
        {isReady && original ? (
          <>
            원본: {original.meta.width}×{original.meta.height} ({formatBytes(original.meta.bytes)})
            {hasEdits && current && (
              <>
                {" → "}현재: {current.meta.width}×{current.meta.height}{" "}
                ({formatBytes(current.meta.bytes)})
              </>
            )}
          </>
        ) : (
          <span>이미지를 불러오면 정보가 표시됩니다</span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {hasEdits && (
          <Button variant="ghost" size="sm" onClick={revertToOriginal} className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">원본 복원</span>
          </Button>
        )}
        {isReady && (
          <Button variant="ghost" size="sm" onClick={clear} className="gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">새 이미지</span>
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                disabled={!isReady || downloading}
                className="gap-1"
              />
            }
          >
            <span className="font-mono text-xs">{formatDef.label}</span>
            <ChevronDown className="w-3 h-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            {EXPORT_FORMATS.map((f) => (
              <DropdownMenuItem
                key={f.id}
                onClick={() => setFormat(f.id)}
                className="font-mono text-xs"
              >
                {f.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          disabled={!isReady || downloading}
          onClick={handleDownload}
          className="gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          {downloading ? "처리 중..." : "다운로드"}
        </Button>
      </div>
    </div>
  );
}
