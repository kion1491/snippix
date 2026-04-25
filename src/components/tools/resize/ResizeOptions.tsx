"use client";

import { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useEditorStore } from "@/store/editor-store";
import { resizeImage } from "@/lib/image/resize";
import { toast } from "sonner";
import { presetButtonClass } from "@/lib/utils";
import { ToolFooter } from "@/components/tools/ToolFooter";
import { SectionHeader } from "@/components/tools/SectionHeader";

const PERCENT_PRESETS = [25, 50, 75, 100, 150, 200];

export function ResizeOptions() {
  const current = useEditorStore((s) => s.current);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const commitEdit = useEditorStore((s) => s.commitEdit);

  const iw = current?.meta.width ?? 0;
  const ih = current?.meta.height ?? 0;

  const [mode, setMode] = useState<"pixel" | "percent">("pixel");
  const [lockAspect, setLockAspect] = useState(true);
  const [width, setWidth] = useState(iw);
  const [height, setHeight] = useState(ih);
  const [percent, setPercent] = useState(100);
  const [applying, setApplying] = useState(false);

  if (!current) return null;

  const aspect = iw / ih;

  const clampDim = (n: number) => {
    if (!Number.isFinite(n) || n < 1) return 1;
    return Math.min(16384, Math.round(n));
  };

  const updateWidth = (next: number) => {
    const v = clampDim(next);
    setWidth(v);
    if (lockAspect) setHeight(clampDim(v / aspect));
  };
  const updateHeight = (next: number) => {
    const v = clampDim(next);
    setHeight(v);
    if (lockAspect) setWidth(clampDim(v * aspect));
  };

  const switchMode = (next: "pixel" | "percent") => {
    if (next === mode) return;
    if (next === "percent") {
      setPercent(Math.round((width / iw) * 100));
    } else {
      const p = percent / 100;
      setWidth(Math.max(1, Math.round(iw * p)));
      setHeight(Math.max(1, Math.round(ih * p)));
    }
    setMode(next);
  };

  const targetW =
    mode === "pixel" ? width : Math.max(1, Math.round((iw * percent) / 100));
  const targetH =
    mode === "pixel" ? height : Math.max(1, Math.round((ih * percent) / 100));
  const isUpscale = targetW > iw || targetH > ih;

  const handleApply = async () => {
    setApplying(true);
    try {
      const resized = await resizeImage(current, targetW, targetH);
      commitEdit(resized);
      toast.success(`크기를 ${targetW} × ${targetH}px 로 변경했습니다.`);
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
        {/* 입력 방식 토글 */}
        <section>
          <SectionHeader>입력 방식</SectionHeader>
          <div className="grid grid-cols-2 gap-1">
            {(["pixel", "percent"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={presetButtonClass(mode === m)}
              >
                {m === "pixel" ? "픽셀" : "퍼센트"}
              </button>
            ))}
          </div>
        </section>

        <Separator />

        {/* 비율 잠금 */}
        <section>
          <div className="flex items-center justify-between">
            <Label htmlFor="lock-aspect" className="flex items-center gap-2 text-sm cursor-pointer">
              {lockAspect ? (
                <Lock className="w-3.5 h-3.5" />
              ) : (
                <Unlock className="w-3.5 h-3.5" />
              )}
              가로세로 비율 잠금
            </Label>
            <Switch
              id="lock-aspect"
              checked={lockAspect}
              onCheckedChange={setLockAspect}
            />
          </div>
        </section>

        <Separator />

        {/* 픽셀 입력 */}
        {mode === "pixel" && (
          <section>
            <SectionHeader>크기 (픽셀)</SectionHeader>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="resize-w" className="text-xs">너비</Label>
                <Input
                  id="resize-w"
                  type="number"
                  min={1}
                  max={16384}
                  value={width}
                  onChange={(e) => updateWidth(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="resize-h" className="text-xs">높이</Label>
                <Input
                  id="resize-h"
                  type="number"
                  min={1}
                  max={16384}
                  value={height}
                  onChange={(e) => updateHeight(Number(e.target.value))}
                />
              </div>
            </div>
          </section>
        )}

        {/* 퍼센트 입력 */}
        {mode === "percent" && (
          <section>
            <SectionHeader>비율 (%)</SectionHeader>
            <div className="space-y-2">
              <Input
                type="number"
                min={1}
                max={1000}
                value={percent}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setPercent(Number.isFinite(n) && n >= 1 ? Math.min(1000, Math.round(n)) : 1);
                }}
              />
              <div className="grid grid-cols-3 gap-1">
                {PERCENT_PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPercent(p)}
                    className={presetButtonClass(percent === p)}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        <Separator />

        {/* 결과 미리보기 */}
        <section className="space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>원본</span>
            <span className="font-mono">{iw} × {ih}px</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>결과</span>
            <span className="font-mono">{targetW} × {targetH}px</span>
          </div>
          {isUpscale && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              원본보다 커지면 화질이 저하될 수 있습니다.
            </p>
          )}
        </section>
      </div>

      <ToolFooter applying={applying} onCancel={handleCancel} onApply={handleApply} />
    </div>
  );
}
