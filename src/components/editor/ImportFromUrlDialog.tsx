"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store/editor-store";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ImportFromUrlDialog({ open, onClose }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const loadUrl = useEditorStore((s) => s.loadUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    try {
      await loadUrl(url.trim());
      onClose();
      setUrl("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>URL로 이미지 불러오기</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="img-url">이미지 URL</Label>
              <Input
                id="img-url"
                placeholder="https://example.com/image.png"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                autoFocus
              />
            </div>
            <p className="text-xs text-muted-foreground">
              CORS가 허용된 URL만 불러올 수 있습니다. 일부 사이트의 이미지는 직접 불러오기가 제한될 수 있습니다.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={!url.trim() || loading}>
              {loading ? "불러오는 중..." : "불러오기"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
