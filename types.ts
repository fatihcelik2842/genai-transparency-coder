export interface TransparencyVar {
  score: number | null;
  confidence: string;
  explanation_en: string;
  explanation_tr: string;
  quote?: string;
  location?: string;
}

export interface AnalysisResult {
  found_genai_disclosure: boolean;
  message_en?: string;
  message_tr?: string;
  v1?: TransparencyVar;
  v2?: TransparencyVar;
  v3?: TransparencyVar;
  v4?: TransparencyVar;
  v5?: TransparencyVar;
  v6?: TransparencyVar;
  total_score: number | null;
  category: string;
  overall_confidence: string;
  warnings?: string[];
}

export type ProcessingStatus = 'idle' | 'loading' | 'ocr' | 'analyzing' | 'complete' | 'error';

export type ModelProvider = 'gemini' | 'claude';

export interface PdfData {
  file: File;
  pageCount: number;
  extractedText: string;
  ocrText: string;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}