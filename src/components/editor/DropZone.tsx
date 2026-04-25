"use client";

import { useRef } from "react";
import { UploadCloud, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store/editor-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  isDragOver: boolean;
  onOpenUrlDialog: () => void;
}

export function DropZone({ isDragOver, onOpenUrlDialog }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const loadFile = useEditorStore((s) => s.loadFile);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await loadFile(file);
    } catch (err) {
      toast.error((err as Error).message);
    }
    e.target.value = "";
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6 h-full rounded-xl border-2 border-dashed transition-colors",
        isDragOver
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      )}
    >
      <div className="flex flex-col items-center gap-3 text-center px-4">
        <div className="p-4 rounded-full bg-muted">
          <UploadCloud className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <p className="text-base font-medium">
            {isDragOver ? "놓으면 바로 열립니다!" : "여기에 이미지를 끌어다 놓으세요"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            JPG, PNG, WebP, GIF, SVG, AVIF 지원
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={() => inputRef.current?.click()}>파일 선택</Button>
        <Button variant="outline" onClick={onOpenUrlDialog}>
          <Link2 className="w-4 h-4 mr-1.5" />
          URL로 불러오기
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        또는 <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">Cmd+V</kbd> 로
        클립보드에서 붙여넣기
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
