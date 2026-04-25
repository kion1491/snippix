"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store/editor-store";
import { cropImage } from "@/lib/image/crop";
import { RATIO_PRESETS, SIZE_PRESETS } from "@/lib/presets/crop-presets";
import { toast } from "sonner";
import { presetButtonClass } from "@/lib/utils";
import { ToolFooter } from "@/components/tools/ToolFooter";
import { SectionHeader } from "@/components/tools/SectionHeader";

export function CropOptions() {
  const current = useEditorStore((s) => s.current);
  const cropRegion = useEditorStore((s) => s.cropRegion);
  const cropAspect = useEditorStore((s) => s.cropAspect);
  const setCropRegion = useEditorStore((s) => s.setCropRegion);
  const setCropAspect = useEditorStore((s) => s.setCropAspect);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const commitEdit = useEditorStore((s) => s.commitEdit);

  const [applying, setApplying] = useState(false);

  if (!current) return null;
  const { width: iw, height: ih } = current.meta;

  const round = (n: number) => Math.round(n);
  const region = cropRegion ?? { x: 0, y: 0, width: iw, height: ih };

  const updateField = (key: "x" | "y" | "width" | "height", value: number) => {
    const next = { ...region, [key]: value };
    next.x = Math.max(0, Math.min(next.x, iw - 1));
    next.y = Math.max(0, Math.min(next.y, ih - 1));
    next.width = Math.max(1, Math.min(next.width, iw - next.x));
    next.height = Math.max(1, Math.min(next.height, ih - next.y));
    setCropRegion(next);
  };

  const applySizePreset = (w: number, h: number) => {
    setCropAspect(undefined); // 사이즈 프리셋은 비율 잠금 해제
    const targetW = Math.min(w, iw);
    const targetH = Math.min(h, ih);
    setCropRegion({
      x: Math.round((iw - targetW) / 2),
      y: Math.round((ih - targetH) / 2),
      width: targetW,
      height: targetH,
    });
  };

  const handleApply = async () => {
    if (!cropRegion) return;
    setApplying(true);
    try {
      const cropped = await cropImage(current, cropRegion);
      commitEdit(cropped);
      toast.success("자르기를 적용했습니다.");
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
        {/* 비율 프리셋 */}
        <section>
          <SectionHeader>비율</SectionHeader>
          <div className="grid grid-cols-4 gap-1">
            {RATIO_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setCropAspect(p.aspect)}
                className={presetButtonClass(cropAspect === p.aspect)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </section>

        <Separator />

        {/* 사이즈 프리셋 */}
        <section>
          <SectionHeader>사이즈 프리셋</SectionHeader>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm" className="w-full justify-start" />
              }
            >
              소셜미디어 사이즈 선택
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              {SIZE_PRESETS.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  onClick={() => applySizePreset(p.width, p.height)}
                >
                  <div className="flex flex-col">
                    <span className="text-sm">{p.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {p.width} × {p.height}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </section>

        <Separator />

        {/* 픽셀 단위 입력 */}
        <section>
          <SectionHeader>영역 (픽셀)</SectionHeader>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="crop-x" className="text-xs">X</Label>
              <Input
                id="crop-x"
                type="number"
                min={0}
                max={iw}
                value={round(region.x)}
                onChange={(e) => updateField("x", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="crop-y" className="text-xs">Y</Label>
              <Input
                id="crop-y"
                type="number"
                min={0}
                max={ih}
                value={round(region.y)}
                onChange={(e) => updateField("y", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="crop-w" className="text-xs">너비</Label>
              <Input
                id="crop-w"
                type="number"
                min={1}
                max={iw}
                value={round(region.width)}
                onChange={(e) => updateField("width", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="crop-h" className="text-xs">높이</Label>
              <Input
                id="crop-h"
                type="number"
                min={1}
                max={ih}
                value={round(region.height)}
                onChange={(e) => updateField("height", Number(e.target.value))}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            원본: {iw} × {ih}px
          </p>
        </section>
      </div>

      <ToolFooter
        applying={applying}
        applyDisabled={!cropRegion}
        onCancel={handleCancel}
        onApply={handleApply}
      />
    </div>
  );
}
