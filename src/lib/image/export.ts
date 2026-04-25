import { getExportFormatDef, stripExtension, type ExportFormat } from "./formats";
import { imageSrcToPdfBlob } from "./pdf";
import { decodeImage } from "./load";

const LOSSY_QUALITY = 0.92;

export function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
  mime = "image/png",
  quality = 1
): void {
  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      triggerDownload(blob, filename);
    },
    mime,
    quality
  );
}

export function downloadFromSrc(src: string, filename: string): void {
  const a = document.createElement("a");
  a.href = src;
  a.download = filename;
  a.click();
}

export async function downloadAs(
  src: string,
  format: ExportFormat,
  baseName: string
): Promise<void> {
  const def = getExportFormatDef(format);
  const filename = `${stripExtension(baseName) || "image"}.${def.ext}`;

  const blob =
    format === "pdf"
      ? await imageSrcToPdfBlob(src)
      : await imageSrcToRasterBlob(src, def.mime);

  triggerDownload(blob, filename);
}

async function imageSrcToRasterBlob(src: string, mime: string): Promise<Blob> {
  const img = await decodeImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("캔버스를 사용할 수 없습니다.");

  // JPEG 는 알파 채널을 지원하지 않으므로 흰 배경을 깐다.
  if (mime === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("파일 생성에 실패했습니다.")),
      mime,
      mime === "image/png" ? undefined : LOSSY_QUALITY
    );
  });
}


export function downloadBlob(blob: Blob, filename: string): void {
  triggerDownload(blob, filename);
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
