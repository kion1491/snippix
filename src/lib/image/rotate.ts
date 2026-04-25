import type { ImageAsset } from "@/types/image";
import { decodeImage } from "./load";
import { buildOutputName, rasterizeMime } from "./formats";

function rotatedSize(iw: number, ih: number, rad: number): { w: number; h: number } {
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  return {
    w: Math.round(iw * cos + ih * sin),
    h: Math.round(iw * sin + ih * cos),
  };
}

export async function rotateImage(
  source: ImageAsset,
  angleDeg: number,
  flipH: boolean,
  flipV: boolean
): Promise<ImageAsset> {
  const { width: iw, height: ih } = source.meta;
  const rad = (angleDeg * Math.PI) / 180;

  const { w: ow, h: oh } = rotatedSize(iw, ih, rad);

  const img = await decodeImage(source.src);
  const canvas = document.createElement("canvas");
  canvas.width = ow;
  canvas.height = oh;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 컨텍스트를 생성하지 못했습니다.");

  ctx.translate(ow / 2, oh / 2);
  ctx.rotate(rad);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(img, -iw / 2, -ih / 2);

  const outMime = rasterizeMime(source.meta.mime);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, outMime)
  );
  if (!blob) throw new Error("이미지 변환에 실패했습니다.");

  return {
    src: URL.createObjectURL(blob),
    meta: {
      width: ow,
      height: oh,
      bytes: blob.size,
      mime: outMime,
      name: buildOutputName(source.meta.name, "_rotated", outMime),
    },
  };
}
