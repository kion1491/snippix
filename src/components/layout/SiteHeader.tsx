import { Scissors } from "lucide-react";
import { ThemeToggle } from "@/components/editor/ThemeToggle";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-background shrink-0">
      <div className="flex items-center gap-2">
        <Scissors className="w-5 h-5 text-primary" />
        <span className="font-bold text-lg tracking-tight">Snippix</span>
      </div>
      <ThemeToggle />
    </header>
  );
}
