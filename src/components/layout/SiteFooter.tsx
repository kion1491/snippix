import { ShieldCheck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="flex items-center justify-center gap-1.5 h-9 px-4 border-t border-border bg-background shrink-0 text-xs text-muted-foreground">
      <ShieldCheck className="w-3.5 h-3.5" />
      <span>모든 처리는 브라우저에서 완료됩니다. 이미지는 서버로 전송되지 않습니다.</span>
    </footer>
  );
}
