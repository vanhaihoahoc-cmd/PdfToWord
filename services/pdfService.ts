
import { ExtractedPage } from '../types';

// Use standard ESM import for pdfjs
import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';

export const extractTextFromPdf = async (
  file: File,
  onProgress: (progress: number) => void
): Promise<ExtractedPage[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const extractedPages: ExtractedPage[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map((item: any) => item.str).join(' ');
    
    extractedPages.push({
      pageNumber: i,
      text: text
    });
    
    onProgress(Math.round((i / numPages) * 100));
  }

  return extractedPages;
};
