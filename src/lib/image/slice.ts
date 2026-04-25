import type { ImageAsset } from "@/types/image";
import {
  getExportFormatDef,
  stripExtension,
  type ExportFormat,
} from "./formats";
import { decodeImage } from "./load";

const LOSSY_QUALITY = 0.92;

export interface SlicePiece {
  name: string;
  blob: Blob;
  row: number; // 1-based
  col: number; // 1-based
}

export async function sliceImage(
  source: ImageAsset,
  rows: number,
  cols: number,
  format: ExportFormat
): Promise<SlicePiece[]> {
  if (rows < 1 || cols < 1) {
    throw new Error("행과 열은 1 이상이어야 합니다.");
  }

  const def = getExportFormatDef(format);
  const img = await decodeImage(source.src);
  const totalW = img.naturalWidth;
  const totalH = img.naturalHeight;

  if (totalW < cols || totalH < rows) {
    throw new Error("이미지가 너무 작아 해당 격자로 분할할 수 없습니다.");
  }

  const baseTileW = Math.floor(totalW / cols);
  const baseTileH = Math.floor(totalH / rows);
  const baseName = stripExtension(source.meta.name) || "image";

  const pieces: SlicePiece[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * baseTileW;
      const y = r * baseTileH;
      // 마지막 열/행은 나머지 픽셀까지 흡수해 손실 방지
      const w = c === cols - 1 ? totalW - x : baseTileW;
      const h = r === rows - 1 ? totalH - y : baseTileH;

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("캔버스를 사용할 수 없습니다.");

      if (def.mime === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
      }
      ctx.drawImage(img, x, y, w, h, 0, 0, w, h);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) =>
            b ? resolve(b) : reject(new Error("조각 생성에 실패했습니다.")),
          def.mime,
          def.mime === "image/png" ? undefined : LOSSY_QUALITY
        );
      });

      pieces.push({
        name: `${baseName}_r${r + 1}_c${c + 1}.${def.ext}`,
        blob,
        row: r + 1,
        col: c + 1,
      });
    }
  }

  return pieces;
}

