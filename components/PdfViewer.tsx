import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Handle ESM module structure for pdfjs-dist
// It may export via default or named exports depending on the bundler/CDN
const pdfjs: any = pdfjsLib;
const GlobalWorkerOptions = pdfjs.GlobalWorkerOptions || pdfjs.default?.GlobalWorkerOptions;
const getDocument = pdfjs.getDocument || pdfjs.default?.getDocument;

// Set worker source via CDN for browser compatibility without local build steps
if (typeof window !== 'undefined' && GlobalWorkerOptions) {
  GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs`;
}

interface PdfViewerProps {
  file: File;
  onTextExtracted: (text: string, pageCount: number, doc: any) => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ file, onTextExtracted }) => {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        if (!getDocument) {
            console.error("PDF.js getDocument function not found");
            return;
        }
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = getDocument({ data: arrayBuffer });
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);

        // Extract Text
        let fullText = '';
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += `\n[PAGE ${i}]\n${pageText}`;
        }
        onTextExtracted(fullText, doc.numPages, doc);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };
    if (file) loadPdf();
  }, [file]); 

  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;

      try {
        const page = await pdfDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
            canvasContext: context,
            viewport: viewport,
            };
            await page.render(renderContext).promise;
        }
      } catch (error) {
        console.error('Render error:', error);
      }
    };
    renderPage();
  }, [pdfDoc, currentPage, scale]);

  const changePage = (delta: number) => {
    const newPage = currentPage + delta;
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1a] rounded-lg overflow-hidden">
      <div className="flex-1 overflow-auto p-4 flex justify-center items-start" ref={containerRef}>
        <canvas ref={canvasRef} className="shadow-2xl max-w-full" />
      </div>
      <div className="p-3 border-t border-border bg-card flex justify-center items-center gap-4 z-10">
        <button 
          onClick={() => changePage(-1)} 
          disabled={currentPage <= 1}
          className="px-3 py-1.5 rounded-md border border-border hover:bg-input disabled:opacity-50 text-xs font-semibold"
        >
          ◀ Prev
        </button>
        <span className="font-mono text-sm text-dim">
          <span className="text-text">{currentPage}</span> / {totalPages}
        </span>
        <button 
          onClick={() => changePage(1)} 
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 rounded-md border border-border hover:bg-input disabled:opacity-50 text-xs font-semibold"
        >
          Next ▶
        </button>
        <div className="h-4 w-px bg-border mx-2"></div>
        <select 
            value={scale} 
            onChange={(e) => setScale(Number(e.target.value))}
            className="bg-input border border-border rounded text-xs px-2 py-1 outline-none focus:border-primary"
        >
            <option value={1.0}>100%</option>
            <option value={1.25}>125%</option>
            <option value={1.5}>150%</option>
            <option value={2.0}>200%</option>
        </select>
      </div>
    </div>
  );
};