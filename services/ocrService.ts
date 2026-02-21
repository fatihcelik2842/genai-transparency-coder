import Tesseract from 'tesseract.js';

export const runOCR = async (
  doc: any, 
  pageCount: number, 
  onProgress: (progress: number, status: string) => void
): Promise<string> => {
  let ocrText = '';
  const maxPages = Math.min(pageCount, 15); // Limit to first 15 pages for performance

  for (let i = 1; i <= maxPages; i++) {
    try {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();
      const textLength = textContent.items.map((item: any) => item.str).join('').length;

      // Only run OCR if extracted text is suspicious (less than 300 chars on a page)
      if (textLength < 300) {
        onProgress(50 + (i / pageCount) * 40, `Running OCR on page ${i}...`);
        
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            await page.render({ canvasContext: ctx, viewport }).promise;
            
            const result = await Tesseract.recognize(canvas, 'eng');
            
            if (result.data.text.trim().length > 30) {
            ocrText += `\n[OCR PAGE ${i}]\n${result.data.text}`;
            }
        }
      }
    } catch (e) {
      console.warn(`OCR failed for page ${i}`, e);
    }
  }
  return ocrText;
};