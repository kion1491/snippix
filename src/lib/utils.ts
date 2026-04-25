import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function presetButtonClass(active: boolean, extra?: string): string {
  return cn(
    "h-8 rounded-md text-xs font-medium border transition-colors",
    active
      ? "bg-primary text-primary-foreground border-primary"
      : "bg-background border-border hover:bg-muted",
    extra
  );
}
