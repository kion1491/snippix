"use client";

import { Check, FlipHorizontal, FlipVertical, RotateCcw, RotateCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useEditorStore } from "@/store/editor-store";
import { rotateImage } from "@/lib/image/rotate";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState } from "react";

const QUICK_ANGLES = [
  { label: "90° 좌", icon: RotateCcw, delta: -90 },
  { label: "90° 우", icon: RotateCw,  delta:  90 },
  { label: "180°",   icon: RotateCcw, delta: 180 },
];

function normalizeAngle(a: number): number {
  let n = a % 360;
  if (n > 180) n -= 360;
  if (n <= -180) n += 360;
  return n;
}

export function RotateOptions() {
  const current = useEditorStore((s) => s.current);
  const angle = useEditorStore((s) => s.rotateAngle);
  const flipH = useEditorStore((s) => s.rotateFlipH);
  const flipV = useEditorStore((s) => s.rotateFlipV);
  const setRotateTransform = useEditorStore((s) => s.setRotateTransform);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const commitEdit = useEditorStore((s) => s.commitEdit);

  const [applying, setApplying] = useState(false);

  if (!current) return null;

  const { width: iw, height: ih } = current.meta;

  const rad = (angle * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const outW = Math.round(iw * cos + ih * sin);
  const outH = Math.round(iw * sin + ih * cos);

  const isIdentity = angle === 0 && !flipH && !flipV;

  const handleAngleInput = (v: string) => {
    const n = Number(v);
    if (!isNaN(n)) setRotateTransform(normalizeAngle(Math.max(-180, Math.min(180, n))), flipH, flipV);
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      const result = await rotateImage(current, angle, flipH, flipV);
      commitEdit(result);
      toast.success("회전/반전을 적용했습니다.");
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

        {/* 빠른 회전 */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            빠른 회전
          </h3>
          <div className="grid grid-cols-3 gap-1">
            {QUICK_ANGLES.map(({ label, icon: Icon, delta }) => (
              <button
                key={label}
                onClick={() => setRotateTransform(normalizeAngle(angle + delta), flipH, flipV)}
                className="h-8 rounded-md text-xs font-medium border border-border bg-background hover:bg-muted transition-colors flex items-center justify-center gap-1"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </section>

        <Separator />

        {/* 자유 회전 */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              각도
            </h3>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min={-180}
                max={180}
                value={angle}
                onChange={(e) => handleAngleInput(e.target.value)}
                className="w-20 h-7 text-right font-mono text-sm"
              />
              <Label className="text-xs text-muted-foreground">°</Label>
            </div>
          </div>
          <Slider
            min={-180}
            max={180}
            step={1}
            value={[angle]}
            onValueChange={(v) =>
              setRotateTransform(normalizeAngle(typeof v === "number" ? v : v[0]), flipH, flipV)
            }
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>-180°</span>
            <span>0°</span>
            <span>180°</span>
          </div>
        </section>

        <Separator />

        {/* 반전 */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            반전
          </h3>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setRotateTransform(angle, !flipH, flipV)}
              className={cn(
                "h-8 rounded-md text-xs font-medium border transition-colors flex items-center justify-center gap-1.5",
                flipH
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:bg-muted"
              )}
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
              좌우 반전
            </button>
            <button
              onClick={() => setRotateTransform(angle, flipH, !flipV)}
              className={cn(
                "h-8 rounded-md text-xs font-medium border transition-colors flex items-center justify-center gap-1.5",
                flipV
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:bg-muted"
              )}
            >
              <FlipVertical className="w-3.5 h-3.5" />
              상하 반전
            </button>
          </div>
        </section>

        <Separator />

        {/* 결과 크기 */}
        <section className="space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>원본</span>
            <span className="font-mono">{iw} × {ih}px</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>결과</span>
            <span className="font-mono">{outW} × {outH}px</span>
          </div>
          {angle !== 0 && outW !== iw && (
            <p className="text-xs text-muted-foreground">
              자유 회전 시 이미지 전체가 보이도록 캔버스가 확장됩니다.
            </p>
          )}
        </section>
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center gap-2 p-4 border-t border-border">
        <Button variant="outline" className="flex-1" onClick={handleCancel} disabled={applying}>
          <X className="w-4 h-4 mr-1" />
          취소
        </Button>
        <Button className="flex-1" onClick={handleApply} disabled={applying || isIdentity}>
          <Check className="w-4 h-4 mr-1" />
          {applying ? "적용 중..." : "적용"}
        </Button>
      </div>
    </div>
  );
}
