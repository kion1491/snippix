"use client";

import type { ReactNode } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ToolFooterProps {
  applying: boolean;
  applyDisabled?: boolean;
  applyLabel?: string;
  applyingLabel?: string;
  applyIcon?: ReactNode;
  onCancel: () => void;
  onApply: () => void;
}

export function ToolFooter({
  applying,
  applyDisabled,
  applyLabel = "적용",
  applyingLabel = "적용 중...",
  applyIcon = <Check className="w-4 h-4 mr-1" />,
  onCancel,
  onApply,
}: ToolFooterProps) {
  return (
    <div className="flex items-center gap-2 p-4 border-t border-border">
      <Button variant="outline" className="flex-1" onClick={onCancel} disabled={applying}>
        <X className="w-4 h-4 mr-1" />
        취소
      </Button>
      <Button className="flex-1" onClick={onApply} disabled={applying || applyDisabled}>
        {applyIcon}
        {applying ? applyingLabel : applyLabel}
      </Button>
    </div>
  );
}
