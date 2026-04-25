// jszip을 동적 import 해 초기 번들에서 제외한다.
export async function createZipBlob(
  files: { name: string; blob: Blob }[]
): Promise<Blob> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const f of files) {
    zip.file(f.name, f.blob);
  }
  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}
