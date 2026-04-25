import type { ImageAsset } from "@/types/image";
import { decodeImage } from "./load";
import { buildOutputName, rasterizeMime } from "./formats";

export async function resizeImage(
  source: ImageAsset,
  targetWidth: number,
  targetHeight: number
): Promise<ImageAsset> {
  const w = Math.round(targetWidth);
  const h = Math.round(targetHeight);
  if (w <= 0 || h <= 0) throw new Error("크기 값이 올바르지 않습니다.");
  if (w > 16384 || h > 16384) throw new Error("최대 16384px 까지 지원합니다.");

  const img = await decodeImage(source.src);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 컨텍스트를 생성하지 못했습니다.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);

  const outMime = rasterizeMime(source.meta.mime);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, outMime)
  );
  if (!blob) throw new Error("이미지 변환에 실패했습니다.");

  return {
    src: URL.createObjectURL(blob),
    meta: {
      width: w,
      height: h,
      bytes: blob.size,
      mime: outMime,
      name: buildOutputName(source.meta.name, "_resized", outMime),
    },
  };
}
