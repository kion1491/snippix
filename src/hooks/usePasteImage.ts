"use client";

import { useEffect } from "react";
import { useEditorStore } from "@/store/editor-store";
import { isSupportedMime } from "@/lib/image/formats";
import { toast } from "sonner";

export function usePasteImage() {
  const loadFile = useEditorStore((s) => s.loadFile);

  useEffect(() => {
    const handler = async (e: ClipboardEvent) => {
      if (!e.clipboardData?.items) return;

      const items = Array.from(e.clipboardData.items);
      const imageItem = items.find(
        (item) => item.kind === "file" && isSupportedMime(item.type)
      );
      if (!imageItem) return;

      e.preventDefault();
      const file = imageItem.getAsFile();
      if (!file) return;

      try {
        await loadFile(file);
      } catch (err) {
        toast.error((err as Error).message);
      }
    };

    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, [loadFile]);
}
