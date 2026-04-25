"use client";

import { useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEditorStore } from "@/store/editor-store";
import { sliceImage } from "@/lib/image/slice";
import { createZipBlob } from "@/lib/image/zip";
import { downloadBlob } from "@/lib/image/export";
import {
  EXPORT_FORMATS,
  getExportFormatDef,
  stripExtension,
  type ExportFormat,
} from "@/lib/image/formats";
import { toast } from "sonner";
import { presetButtonClass } from "@/lib/utils";
import { ToolFooter } from "@/components/tools/ToolFooter";
import { SectionHeader } from "@/components/tools/SectionHeader";

const GRID_PRESETS: { label: string; rows: number; cols: number }[] = [
  { label: "2×2", rows: 2, cols: 2 },
  { label: "3×3", rows: 3, cols: 3 },
  { label: "4×4", rows: 4, cols: 4 },
  { label: "1×3", rows: 1, cols: 3 },
  { label: "3×1", rows: 3, cols: 1 },
  { label: "2×3", rows: 2, cols: 3 },
  { label: "3×2", rows: 3, cols: 2 },
  { label: "1×2", rows: 1, cols: 2 },
];

// PDF 는 슬라이스 출력에 부적합
const SLICE_FORMATS = EXPORT_FORMATS.filter((f) => f.id !== "pdf");

export function SliceOptions() {
  const current = useEditorStore((s) => s.current);
  const sliceRows = useEditorStore((s) => s.sliceRows);
  const sliceCols = useEditorStore((s) => s.sliceCols);
  const setSliceGrid = useEditorStore((s) => s.setSliceGrid);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);

  const [format, setFormat] = useState<ExportFormat>("png");
  const [applying, setApplying] = useState(false);

  if (!current) return null;
  const { width: iw, height: ih } = current.meta;
  const formatDef = getExportFormatDef(format);

  const tileW = Math.floor(iw / sliceCols);
  const tileH = Math.floor(ih / sliceRows);
  const totalPieces = sliceRows * sliceCols;

  const updateRows = (n: number) => setSliceGrid(n, sliceCols);
  const updateCols = (n: number) => setSliceGrid(sliceRows, n);

  const handleApply = async () => {
    setApplying(true);
    try {
      const pieces = await sliceImage(current, sliceRows, sliceCols, format);
      const zipBlob = await createZipBlob(
        pieces.map((p) => ({ name: p.name, blob: p.blob }))
      );
      const baseName = stripExtension(current.meta.name) || "image";
      downloadBlob(zipBlob, `${baseName}_${sliceRows}x${sliceCols}.zip`);
      toast.success(`${pieces.length}개 조각을 ZIP으로 다운로드했습니다.`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setApplying(false);
    }
  };

  const handleCancel = () => setActiveTool(null);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* 격자 프리셋 */}
        <section>
          <SectionHeader>격자 프리셋</SectionHeader>
          <div className="grid grid-cols-4 gap-1">
            {GRID_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setSliceGrid(p.rows, p.cols)}
                className={presetButtonClass(p.rows === sliceRows && p.cols === sliceCols)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </section>

        <Separator />

        {/* 행/열 입력 */}
        <section>
          <SectionHeader>행 × 열</SectionHeader>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="slice-rows" className="text-xs">행</Label>
              <Input
                id="slice-rows"
                type="number"
                min={1}
                max={20}
                value={sliceRows}
                onChange={(e) => updateRows(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="slice-cols" className="text-xs">열</Label>
              <Input
                id="slice-cols"
                type="number"
                min={1}
                max={20}
                value={sliceCols}
                onChange={(e) => updateCols(Number(e.target.value))}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            조각 {totalPieces}개 · 약 {tileW}×{tileH}px / 개
          </p>
        </section>

        <Separator />

        {/* 출력 포맷 */}
        <section>
          <SectionHeader>출력 포맷</SectionHeader>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm" className="w-full justify-between" />
              }
            >
              <span className="font-mono">{formatDef.label}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {SLICE_FORMATS.map((f) => (
                <DropdownMenuItem
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className="font-mono"
                >
                  {f.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <p className="text-xs text-muted-foreground mt-2">
            파일명: {stripExtension(current.meta.name) || "image"}_r1_c1.{formatDef.ext} …
          </p>
        </section>
      </div>

      <ToolFooter
        applying={applying}
        applyLabel="ZIP 다운로드"
        applyingLabel="생성 중..."
        applyIcon={<Download className="w-4 h-4 mr-1" />}
        onCancel={handleCancel}
        onApply={handleApply}
      />
    </div>
  );
}
