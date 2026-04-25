// PDF는 동적 import 로 jsPDF 를 로드해 초기 번들에서 제외한다.
export async function imageSrcToPdfBlob(src: string): Promise<Blob> {
  const { jsPDF } = await import("jspdf");

  const img = await loadImage(src);
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  const pdf = new jsPDF({
    orientation: w >= h ? "l" : "p",
    unit: "px",
    format: [w, h],
    hotfixes: ["px_scaling"],
    compress: true,
  });

  // PNG 유지 (투명도 보존). jsPDF 는 HTMLImageElement 를 그대로 받아 내부에서 인코딩.
  pdf.addImage(img, "PNG", 0, 0, w, h);

  return pdf.output("blob");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("이미지를 불러올 수 없습니다."));
    img.src = src;
  });
}
