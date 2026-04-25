"use client";

import { useState } from "react";
import { PanelRight } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ToolTabs } from "./ToolTabs";
import { Canvas } from "./Canvas";
import { DropZone } from "./DropZone";
import { OptionsPanel } from "./OptionsPanel";
import { StatusBar } from "./StatusBar";
import { ImportFromUrlDialog } from "./ImportFromUrlDialog";
import { CropOverlay } from "@/components/tools/crop/CropOverlay";
import { SliceOverlay } from "@/components/tools/slice/SliceOverlay";
import { RotateOverlay } from "@/components/tools/rotate/RotateOverlay";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store/editor-store";
import { useDropImage } from "@/hooks/useDropImage";
import { usePasteImage } from "@/hooks/usePasteImage";

export function EditorShell() {
  const [urlDialogOpen, setUrlDialogOpen] = useState(false);
  const { isDragOver } = useDropImage();
  usePasteImage();

  const status = useEditorStore((s) => s.status);
  const activeTool = useEditorStore((s) => s.activeTool);
  const isReady = status === "ready";

  const panelTitle =
    activeTool === "crop" ? "자르기" :
    activeTool === "slice" ? "슬라이스" :
    activeTool === "resize" ? "크기 조정" :
    activeTool === "rotate" ? "회전/반전" : "옵션";

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <SiteHeader />
      <ToolTabs />

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-hidden p-4">
          {isReady ? (
            activeTool === "crop" ? (
              <CropOverlay />
            ) : activeTool === "slice" ? (
              <SliceOverlay />
            ) : activeTool === "rotate" ? (
              <RotateOverlay />
            ) : (
              <Canvas />
            )
          ) : (
            <DropZone
              isDragOver={isDragOver}
              onOpenUrlDialog={() => setUrlDialogOpen(true)}
            />
          )}
        </main>

        <aside className="hidden lg:flex flex-col w-72 border-l border-border bg-background shrink-0">
          <div className="flex items-center h-10 px-4 border-b border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {panelTitle}
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <OptionsPanel />
          </div>
        </aside>
      </div>

      <StatusBar />
      <SiteFooter />

      {isReady && (
        <div className="fixed bottom-14 right-4 lg:hidden z-10">
          <Sheet>
            <SheetTrigger
              render={
                <Button size="icon" variant="secondary" className="shadow-lg" />
              }
            >
              <PanelRight className="w-4 h-4" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <SheetHeader className="flex items-center h-10 px-4 border-b border-border">
                <SheetTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {panelTitle}
                </SheetTitle>
              </SheetHeader>
              <OptionsPanel />
            </SheetContent>
          </Sheet>
        </div>
      )}

      <ImportFromUrlDialog
        open={urlDialogOpen}
        onClose={() => setUrlDialogOpen(false)}
      />
    </div>
  );
}
