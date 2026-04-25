import type { ImageAsset, ImageMeta } from "@/types/image";
import { isSupportedMime } from "./formats";

export function decodeImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("이미지를 불러오는데 실패했습니다."));
    img.src = src;
  });
}

function buildMeta(
  img: HTMLImageElement,
  mime: string,
  name: string,
  bytes: number
): ImageMeta {
  return { width: img.naturalWidth, height: img.naturalHeight, bytes, mime, name };
}

export async function loadFromFile(file: File): Promise<ImageAsset> {
  if (!isSupportedMime(file.type)) {
    throw new Error(
      `지원하지 않는 형식입니다. JPG, PNG, WebP, GIF, SVG, AVIF 파일만 사용 가능합니다.`
    );
  }

  const src = URL.createObjectURL(file);
  try {
    const img = await decodeImage(src);
    const meta = buildMeta(img, file.type, file.name, file.size);
    return { src, meta };
  } catch (e) {
    URL.revokeObjectURL(src);
    throw e;
  }
}

export async function loadFromUrl(url: string): Promise<ImageAsset> {
  let blob: Blob;
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(`서버 응답 오류: ${res.status}`);
    blob = await res.blob();
  } catch {
    throw new Error(
      "이미지를 불러오지 못했습니다. URL이 올바른지, CORS가 허용된 주소인지 확인해주세요."
    );
  }

  if (!isSupportedMime(blob.type)) {
    throw new Error("지원하지 않는 형식입니다. 이미지 URL을 입력해주세요.");
  }

  const src = URL.createObjectURL(blob);
  const name = url.split("/").pop()?.split("?")[0] ?? "image";
  try {
    const img = await decodeImage(src);
    const meta = buildMeta(img, blob.type, name, blob.size);
    return { src, meta };
  } catch (e) {
    URL.revokeObjectURL(src);
    throw e;
  }
}

export async function loadFromClipboardItems(
  items: DataTransferItemList | ClipboardItem[]
): Promise<ImageAsset | null> {
  const itemArray =
    items instanceof DataTransferItemList
      ? Array.from(items)
      : (items as ClipboardItem[]);

  for (const item of itemArray) {
    if (item instanceof DataTransferItem) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file && isSupportedMime(file.type)) {
          return loadFromFile(file);
        }
      }
    } else {
      for (const type of item.types) {
        if (isSupportedMime(type)) {
          const blob = await item.getType(type);
          const file = new File([blob], "clipboard-image", { type });
          return loadFromFile(file);
        }
      }
    }
  }
  return null;
}
