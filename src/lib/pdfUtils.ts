import PDFParser from "pdf2json";

export async function extractTextFromPDF(file: File): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const pdfParser = new PDFParser();

      pdfParser.on("pdfParser_dataError", (errData: any) => {
        pdfParser.removeAllListeners();
        reject(new Error(errData.parserError));
      });

      pdfParser.on("pdfParser_dataReady", () => {
        try {
          const text = pdfParser.getRawTextContent();
          pdfParser.removeAllListeners();
          resolve(text);
        } catch (err) {
          reject(err);
        }
      });

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // If the buffer is empty, reject early
      if (!buffer || buffer.length === 0) {
        return reject(new Error("Empty file buffer"));
      }

      pdfParser.parseBuffer(buffer);
    } catch (error) {
      reject(error);
    }
  });
}

export function cleanResumeText(rawText: string): string {
  return rawText
    ? rawText.replace(/\r/g, " ").replace(/\n{2,}/g, "\n").replace(/[ \t]+/g, " ").trim()
    : "";
}
