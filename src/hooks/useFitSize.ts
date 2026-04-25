import { useEffect, useState, type RefObject } from "react";

/**
 * 컨테이너 크기에 맞게 이미지를 fit 할 때의 표시 크기를 반환한다.
 * scale = min(containerW / naturalW, containerH / naturalH, 1)
 */
export function useFitSize(
  containerRef: RefObject<HTMLElement | null>,
  natural: { width: number; height: number } | null
): { w: number; h: number } | null {
  const [fitSize, setFitSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (!natural || !containerRef.current) return;
    const container = containerRef.current;
    const { width: iw, height: ih } = natural;

    const compute = () => {
      const { width: cw, height: ch } = container.getBoundingClientRect();
      if (cw === 0 || ch === 0) return;
      const scale = Math.min(cw / iw, ch / ih, 1);
      setFitSize({ w: Math.round(iw * scale), h: Math.round(ih * scale) });
    };

    const ro = new ResizeObserver(compute);
    ro.observe(container);
    compute();
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [natural?.width, natural?.height, containerRef]);

  return fitSize;
}
