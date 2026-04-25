export interface ImageMeta {
  width: number;
  height: number;
  bytes: number;
  mime: string;
  name: string;
}

export interface ImageAsset {
  src: string;
  meta: ImageMeta;
}

export type EditorStatus = "idle" | "loading" | "ready" | "error";

export type Tool = "crop" | "slice" | "resize" | "rotate" | null;

export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}
