export const MAX_MATERIAL_LENGTH = 30_000;

export interface ExtractedPdf {
  text: string;
  pageCount: number;
  truncated: boolean;
}

export async function extractPdfText(file: File): Promise<ExtractedPdf> {
  const pdfjs = await import("pdfjs-dist");

  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const data = new Uint8Array(await file.arrayBuffer());
  const document = await pdfjs.getDocument({ data }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (text) {
      pages.push(text);
    }
  }

  const fullText = pages.join("\n\n");
  const truncated = fullText.length > MAX_MATERIAL_LENGTH;

  return {
    text: truncated ? fullText.slice(0, MAX_MATERIAL_LENGTH) : fullText,
    pageCount: document.numPages,
    truncated,
  };
}
