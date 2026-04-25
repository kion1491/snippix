import type { ImageAsset, CropRegion } from "@/types/image";
import { decodeImage } from "./load";
import { buildOutputName, rasterizeMime } from "./formats";

export async function cropImage(
  source: ImageAsset,
  region: CropRegion
): Promise<ImageAsset> {
  const width = Math.round(region.width);
  const height = Math.round(region.height);
  const x = Math.round(region.x);
  const y = Math.round(region.y);

  if (width <= 0 || height <= 0) {
    throw new Error("자르기 영역이 너무 작습니다.");
  }

  const img = await decodeImage(source.src);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 컨텍스트를 생성하지 못했습니다.");
  ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

  const outMime = rasterizeMime(source.meta.mime);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, outMime)
  );
  if (!blob) throw new Error("이미지 변환에 실패했습니다.");

  return {
    src: URL.createObjectURL(blob),
    meta: {
      width,
      height,
      bytes: blob.size,
      mime: outMime,
      name: buildOutputName(source.meta.name, "_cropped", outMime),
    },
  };
}
