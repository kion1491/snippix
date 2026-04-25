export const SUPPORTED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

export const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

export function isSupportedMime(mime: string): boolean {
  return SUPPORTED_MIMES.has(mime);
}

export function extFromMime(mime: string): string {
  return MIME_TO_EXT[mime] ?? "png";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export type ExportFormat = "png" | "jpg" | "jpeg" | "webp" | "pdf";

export interface ExportFormatDef {
  id: ExportFormat;
  label: string;
  ext: string;
  mime: string;
}

export const EXPORT_FORMATS: ExportFormatDef[] = [
  { id: "png", label: "PNG", ext: "png", mime: "image/png" },
  { id: "jpg", label: "JPG", ext: "jpg", mime: "image/jpeg" },
  { id: "jpeg", label: "JPEG", ext: "jpeg", mime: "image/jpeg" },
  { id: "webp", label: "WebP", ext: "webp", mime: "image/webp" },
  { id: "pdf", label: "PDF", ext: "pdf", mime: "application/pdf" },
];

export function getExportFormatDef(id: ExportFormat): ExportFormatDef {
  return EXPORT_FORMATS.find((f) => f.id === id) ?? EXPORT_FORMATS[0];
}

export function stripExtension(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx > 0 ? name.slice(0, idx) : name;
}

export function rasterizeMime(mime: string): string {
  return mime === "image/svg+xml" ? "image/png" : mime;
}

/** 출력 MIME 기반으로 확장자를 교정하면서 suffix 를 삽입한 파일명을 만든다. */
export function buildOutputName(originalName: string, suffix: string, outMime: string): string {
  const base = stripExtension(originalName) || "image";
  const ext = extFromMime(outMime);
  return `${base}${suffix}.${ext}`;
}
