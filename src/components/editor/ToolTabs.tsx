"use client";

import { Crop, Grid3x3, Maximize2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor-store";
import type { Tool } from "@/types/image";

interface ToolDef {
  id: Tool & string;
  label: string;
  icon: typeof Crop;
}

const TOOLS: ToolDef[] = [
  { id: "crop", label: "자르기", icon: Crop },
  { id: "slice", label: "슬라이스", icon: Grid3x3 },
  { id: "resize", label: "크기 조정", icon: Maximize2 },
  { id: "rotate", label: "회전/반전", icon: RotateCcw },
];

export function ToolTabs() {
  const status = useEditorStore((s) => s.status);
  const activeTool = useEditorStore((s) => s.activeTool);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);

  const isReady = status === "ready";

  return (
    <div className="flex items-center gap-1 px-4 h-11 border-b border-border bg-background shrink-0 overflow-x-auto">
      {TOOLS.map(({ id, label, icon: Icon }) => {
        const isActive = activeTool === id;
        const isDisabled = !isReady;

        return (
          <button
            key={id}
            disabled={isDisabled}
            onClick={() => {
              if (!isReady) return;
              setActiveTool(isActive ? null : (id as Tool));
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 h-8 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
              isDisabled && "text-muted-foreground cursor-not-allowed opacity-50",
              !isDisabled && !isActive && "hover:bg-muted text-foreground",
              isActive && "bg-primary text-primary-foreground"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
