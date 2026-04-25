"use client";

import { create } from "zustand";
import type { ImageAsset, EditorStatus, Tool, CropRegion } from "@/types/image";
import { loadFromFile, loadFromUrl } from "@/lib/image/load";

interface EditorState {
  original: ImageAsset | null;
  current: ImageAsset | null;
  status: EditorStatus;
  error: string | undefined;
  activeTool: Tool;
  cropRegion: CropRegion | null;
  cropAspect: number | undefined;
  sliceRows: number;
  sliceCols: number;
  rotateAngle: number;
  rotateFlipH: boolean;
  rotateFlipV: boolean;

  loadFile: (file: File) => Promise<void>;
  loadUrl: (url: string) => Promise<void>;
  clear: () => void;
  revertToOriginal: () => void;

  setActiveTool: (tool: Tool) => void;
  setCropRegion: (region: CropRegion | null) => void;
  setCropAspect: (aspect: number | undefined) => void;
  setSliceGrid: (rows: number, cols: number) => void;
  setRotateTransform: (angle: number, flipH: boolean, flipV: boolean) => void;
  commitEdit: (asset: ImageAsset) => void;
}

function revokeIfDifferent(asset: ImageAsset | null, keep: ImageAsset | null) {
  if (asset && asset !== keep && asset.src.startsWith("blob:")) {
    URL.revokeObjectURL(asset.src);
  }
}

const ROTATE_RESET = { rotateAngle: 0, rotateFlipH: false, rotateFlipV: false };
const TOOL_RESET = { activeTool: null as Tool, cropRegion: null, cropAspect: undefined as number | undefined, ...ROTATE_RESET };

export const useEditorStore = create<EditorState>((set, get) => ({
  original: null,
  current: null,
  status: "idle",
  error: undefined,
  activeTool: null,
  cropRegion: null,
  cropAspect: undefined,
  sliceRows: 2,
  sliceCols: 2,
  ...ROTATE_RESET,

  loadFile: async (file: File) => {
    const { original, current } = get();
    revokeIfDifferent(current, original);
    if (original) URL.revokeObjectURL(original.src);

    set({ status: "loading", error: undefined, ...TOOL_RESET });
    try {
      const asset = await loadFromFile(file);
      set({ original: asset, current: asset, status: "ready" });
    } catch (e) {
      set({ status: "error", error: (e as Error).message });
    }
  },

  loadUrl: async (url: string) => {
    const { original, current } = get();
    revokeIfDifferent(current, original);
    if (original) URL.revokeObjectURL(original.src);

    set({ status: "loading", error: undefined, ...TOOL_RESET });
    try {
      const asset = await loadFromUrl(url);
      set({ original: asset, current: asset, status: "ready" });
    } catch (e) {
      set({ status: "error", error: (e as Error).message });
    }
  },

  clear: () => {
    const { original, current } = get();
    revokeIfDifferent(current, original);
    if (original) URL.revokeObjectURL(original.src);
    set({
      original: null,
      current: null,
      status: "idle",
      error: undefined,
      ...TOOL_RESET,
    });
  },

  revertToOriginal: () => {
    const { original, current } = get();
    if (!original) return;
    revokeIfDifferent(current, original);
    set({ current: original, ...TOOL_RESET });
  },

  setActiveTool: (tool) => {
    if (tool === null) {
      set(TOOL_RESET);
      return;
    }
    set({ activeTool: tool, ...ROTATE_RESET });
  },

  setCropRegion: (region) => set({ cropRegion: region }),
  setCropAspect: (aspect) => set({ cropAspect: aspect }),
  setSliceGrid: (rows, cols) =>
    set({
      sliceRows: Math.max(1, Math.min(20, Math.round(rows))),
      sliceCols: Math.max(1, Math.min(20, Math.round(cols))),
    }),

  setRotateTransform: (angle, flipH, flipV) =>
    set({ rotateAngle: angle, rotateFlipH: flipH, rotateFlipV: flipV }),

  commitEdit: (asset) => {
    const { original, current } = get();
    revokeIfDifferent(current, original);
    set({ current: asset, ...TOOL_RESET });
  },
}));
