import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ProtocolModal } from './components/ProtocolModal';
import { PdfViewer } from './components/PdfViewer';
import { ChatInterface } from './components/ChatInterface';
import { runOCR } from './services/ocrService';
import { analyzeDocument } from './services/geminiService';
import { analyzeDocumentClaude } from './services/claudeService';
import { AnalysisResult, PdfData, ProcessingStatus, ToastMessage, TransparencyVar, ModelProvider } from './types';

const LS_GEMINI_KEY = 'GEMINI_API_KEY';
const LS_CLAUDE_KEY = 'CLAUDE_API_KEY';

// Helper: detect provider from model id
const getProvider = (model: string): ModelProvider =>
  model.startsWith('claude') ? 'claude' : 'gemini';

// --- Settings Modal ---
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveGemini: (key: string) => void;
  onSaveClaude: (key: string) => void;
  currentGeminiKey: string;
  currentClaudeKey: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, onSaveGemini, onSaveClaude, currentGeminiKey, currentClaudeKey
}) => {
  const [activeProvider, setActiveProvider] = useState<'gemini' | 'claude'>('gemini');
  const [geminiDraft, setGeminiDraft] = useState(currentGeminiKey);
  const [claudeDraft, setClaudeDraft] = useState(currentClaudeKey);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGeminiDraft(currentGeminiKey);
      setClaudeDraft(currentClaudeKey);
      setShowKey(false);
      // Auto-select the tab for which no key exists yet, or default to gemini
      if (!currentGeminiKey && currentClaudeKey) setActiveProvider('gemini');
      else if (currentGeminiKey && !currentClaudeKey) setActiveProvider('claude');
      else setActiveProvider('gemini');
    }
  }, [isOpen, currentGeminiKey, currentClaudeKey]);

  if (!isOpen) return null;

  const isGemini = activeProvider === 'gemini';
  const draft = isGemini ? geminiDraft : claudeDraft;
  const setDraft = isGemini ? setGeminiDraft : setClaudeDraft;
  const savedKey = isGemini ? currentGeminiKey : currentClaudeKey;
  const onSave = () => {
    if (isGemini) onSaveGemini(geminiDraft.trim());
    else onSaveClaude(claudeDraft.trim());
  };
  const onClear = () => {
    if (isGemini) { setGeminiDraft(''); onSaveGemini(''); }
    else { setClaudeDraft(''); onSaveClaude(''); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-bold flex items-center gap-2">🔑 API Key Settings</h2>
          <button onClick={onClose} className="text-muted hover:text-text transition-colors text-xl leading-none">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-muted leading-relaxed">
            Only <span className="text-primary font-semibold">one key</span> is needed — choose your preferred provider. Keys are saved in your browser's localStorage only.
          </p>

          {/* Provider tabs */}
          <div className="flex rounded-xl overflow-hidden border border-border text-sm font-bold">
            <button
              onClick={() => setActiveProvider('gemini')}
              className={`flex-1 py-2.5 flex items-center justify-center gap-2 transition-colors ${activeProvider === 'gemini' ? 'bg-blue-600 text-white' : 'hover:bg-input text-muted'}`}
            >
              🔷 Gemini
              {currentGeminiKey && <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full">✓ saved</span>}
            </button>
            <button
              onClick={() => setActiveProvider('claude')}
              className={`flex-1 py-2.5 flex items-center justify-center gap-2 transition-colors ${activeProvider === 'claude' ? 'bg-purple-600 text-white' : 'hover:bg-input text-muted'}`}
            >
              🟣 Claude
              {currentClaudeKey && <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full">✓ saved</span>}
            </button>
          </div>

          {/* Key input area */}
          <div className={`rounded-xl border p-4 space-y-3 ${isGemini ? 'border-blue-500/20 bg-blue-500/5' : 'border-purple-500/20 bg-purple-500/5'}`}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{isGemini ? '🔷 Gemini' : '🟣 Claude'} API Key</span>
              {savedKey && (
                <span className="text-[10px] text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
                  saved ···{savedKey.slice(-6)}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && draft.trim() && onSave()}
                placeholder={isGemini ? 'AIza...' : 'sk-ant-...'}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors pr-10 font-mono"
              />
              <button
                onClick={() => setShowKey(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text text-xs"
                type="button"
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onSave}
                disabled={!draft.trim()}
                className={`flex-1 text-white py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-40 ${isGemini ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}`}
              >
                Save Key
              </button>
              {savedKey && (
                <button
                  onClick={onClear}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-danger/40 text-danger hover:bg-danger/10 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-[10px] text-dim">
              {isGemini ? 'Get a free key → aistudio.google.com' : 'Get a key → console.anthropic.com'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg text-sm font-semibold border border-border hover:bg-input transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper to download files
const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export default function App() {
  const [model, setModel] = useState('gemini-3.1-pro-preview');
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [statusText, setStatusText] = useState('Waiting for document...');
  const [progress, setProgress] = useState(0);
  const [pdfData, setPdfData] = useState<PdfData | null>(null);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'results' | 'chat'>('results');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [pdfDocRef, setPdfDocRef] = useState<any>(null);
  const [geminiKey, setGeminiKey] = useState<string>(() => localStorage.getItem(LS_GEMINI_KEY) || '');
  const [claudeKey, setClaudeKey] = useState<string>(() => localStorage.getItem(LS_CLAUDE_KEY) || '');

  // derived: active key based on selected model
  const provider = getProvider(model);
  const activeKey = provider === 'claude' ? claudeKey : geminiKey;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Open settings automatically if no key is saved at all
  useEffect(() => {
    if (!localStorage.getItem(LS_GEMINI_KEY) && !localStorage.getItem(LS_CLAUDE_KEY)) {
      setIsSettingsOpen(true);
    }
  }, []);

  const handleSaveGeminiKey = (key: string) => {
    setGeminiKey(key);
    if (key) { localStorage.setItem(LS_GEMINI_KEY, key); addToast('Gemini API Key saved!', 'success'); }
    else { localStorage.removeItem(LS_GEMINI_KEY); addToast('Gemini API Key cleared', 'info'); }
  };

  const handleSaveClaudeKey = (key: string) => {
    setClaudeKey(key);
    if (key) { localStorage.setItem(LS_CLAUDE_KEY, key); addToast('Claude API Key saved!', 'success'); }
    else { localStorage.removeItem(LS_CLAUDE_KEY); addToast('Claude API Key cleared', 'info'); }
  };

  const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        addToast('Please upload a PDF file', 'error');
        return;
      }
      setPdfData({ file, pageCount: 0, extractedText: '', ocrText: '' });
      setResults(null);
      setStatus('loading');
      setStatusText('Loading document...');
    }
  };

  const handleTextExtracted = useCallback((text: string, pageCount: number, doc: any) => {
    setPdfData(prev => prev ? { ...prev, extractedText: text, pageCount } : null);
    setPdfDocRef(doc);
    setStatus('idle');
    setStatusText('Document ready. Click "Analyze" to start.');
    addToast('PDF loaded successfully', 'success');
  }, []);

  const startAnalysis = async () => {
    if (!pdfData) {
      addToast('No document loaded', 'error');
      return;
    }
    if (!activeKey) {
      setIsSettingsOpen(true);
      addToast(`Please enter your ${provider === 'claude' ? 'Claude' : 'Gemini'} API Key first`, 'warning');
      return;
    }

    setStatus('ocr');
    setStatusText('Checking for OCR needs...');
    setProgress(10);

    try {
      // 1. Run OCR
      const ocrText = await runOCR(pdfDocRef, pdfData.pageCount, (pct, txt) => {
        setProgress(pct);
        setStatusText(txt);
      });
      setPdfData(prev => prev ? { ...prev, ocrText } : null);

      // 2. Call API
      setStatus('analyzing');
      setStatusText(`Sending to ${model}...`);
      setProgress(75);

      const combinedText = pdfData.extractedText + '\n' + ocrText;
      const result = provider === 'claude'
        ? await analyzeDocumentClaude(model, combinedText, activeKey)
        : await analyzeDocument(model, combinedText, activeKey);

      setResults(result);
      setProgress(100);
      setStatus('complete');
      setStatusText('Analysis complete');
      addToast('Coding completed!', 'success');

      if (result.found_genai_disclosure === false) {
        addToast(result.message_en || 'No GenAI disclosure found', 'warning');
      }

    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setStatusText('Failed to analyze');
      addToast('Error: ' + error.message, 'error');
    }
  };

  const handleExportJSON = () => {
    if (!results || !pdfData) return;
    const json = JSON.stringify({
      file: pdfData.file.name,
      date: new Date().toISOString(),
      model,
      results
    }, null, 2);
    downloadFile(json, `coding_${pdfData.file.name.replace('.pdf', '')}.json`, 'application/json');
    addToast('JSON exported', 'success');
  };

  const handleExportCSV = () => {
    if (!results || !pdfData) return;
    const headers = ['File', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'Total', 'Category'];
    const row = [
      pdfData.file.name,
      results.v1?.score ?? '',
      results.v2?.score ?? '',
      results.v3?.score ?? '',
      results.v4?.score ?? '',
      results.v5?.score ?? '',
      results.v6?.score ?? '',
      results.total_score ?? '',
      results.category ?? ''
    ];
    const csv = headers.join(',') + '\n' + row.join(',');
    downloadFile(csv, `coding_${pdfData.file.name.replace('.pdf', '')}.csv`, 'text/csv');
    addToast('CSV exported', 'success');
  };

  const handleExportReport = () => {
    if (!results || !pdfData) return;
    const html = `<!DOCTYPE html><html><head><title>GenAI Transparency Report - ${pdfData.file.name}</title>
<style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px;background:#f8fafc;color:#1e293b}h1{color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:10px}.score-box{background:linear-gradient(135deg,#3b82f6,#ef4444);color:white;padding:30px;border-radius:12px;text-align:center;margin:30px 0;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1)}.total{font-size:56px;font-weight:bold;line-height:1}.var{margin:20px 0;padding:20px;background:white;border-left:5px solid #3b82f6;border-radius:0 8px 8px 0;box-shadow:0 1px 3px rgba(0,0,0,0.1)}.var h3{margin:0 0 10px;color:#3b82f6}.quote{background:#f1f5f9;padding:15px;border-radius:6px;font-family:monospace;font-size:0.9rem;margin-top:15px;border:1px solid #e2e8f0;color:#334155}</style></head>
<body><h1>GenAI Transparency Coding Report</h1>
<p><strong>File:</strong> ${pdfData.file.name}<br><strong>Model:</strong> ${model}<br><strong>Date:</strong> ${new Date().toLocaleString()}</p>
<div class="score-box"><div class="total">${results.total_score ?? 'N/A'}</div><div style="font-size:1.2rem;margin-top:10px;opacity:0.9">${results.category || ''} Transparency</div></div>
${['v1','v2','v3','v4','v5','v6'].map(key => {
    // @ts-ignore
    const d = results[key] as TransparencyVar;
    const names: any = {v1:'V1. Location',v2:'V2. Tool',v3:'V3. Purpose',v4:'V4. Prompt',v5:'V5. Verification',v6:'V6. Limitation'};
    return `<div class="var"><h3>${names[key]}: ${d?.score ?? 'N/F'}</h3><p><strong>EN:</strong> ${d?.explanation_en || 'N/A'}</p><p><strong>TR:</strong> ${d?.explanation_tr || 'N/A'}</p>${d?.quote ? `<div class="quote">"${d.quote}"</div>` : ''}</div>`;
}).join('')}
</body></html>`;
    downloadFile(html, `report_${pdfData.file.name.replace('.pdf', '')}.html`, 'text/html');
    addToast('Report exported', 'success');
  };

  return (
    <div className="min-h-screen bg-bg text-text font-sans flex flex-col">
      <Header
        onOpenProtocol={() => setIsProtocolOpen(true)}
        onUploadClick={() => fileInputRef.current?.click()}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasApiKey={!!activeKey}
      />
      
      <main className="flex-1 p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-[1fr_460px] gap-6 max-w-[1800px] mx-auto w-full">
        
        {/* Left Column: PDF & Upload */}
        <section className="bg-card border border-border rounded-xl overflow-hidden flex flex-col h-[85vh]">
          <div className="p-4 border-b border-border font-semibold text-sm flex justify-between items-center bg-card/50">
            <span className="flex items-center gap-2">📄 Document <span className="text-muted font-normal">{pdfData?.file.name}</span></span>
          </div>
          
          <div className="flex-1 overflow-hidden relative bg-bg">
             <input type="file" ref={fileInputRef} accept=".pdf" className="hidden" onChange={handleFileChange} />
             
             {!pdfData ? (
               <div 
                  className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors border-2 border-dashed border-border m-4 rounded-xl"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary', 'bg-blue-500/10'); }}
                  onDragLeave={(e) => { e.currentTarget.classList.remove('border-primary', 'bg-blue-500/10'); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-primary', 'bg-blue-500/10');
                    if(e.dataTransfer.files[0]?.type === 'application/pdf') {
                        const file = e.dataTransfer.files[0];
                         setPdfData({ file, pageCount: 0, extractedText: '', ocrText: '' });
                         setResults(null);
                         setStatus('loading');
                         setStatusText('Loading document...');
                    } else {
                        addToast('Please upload a PDF file', 'error');
                    }
                  }}
               >
                 <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-red-500 rounded-full flex items-center justify-center text-3xl mb-4 shadow-xl">📎</div>
                 <h3 className="text-lg font-bold">Upload PDF Article</h3>
                 <p className="text-muted text-sm mt-1">Drag & drop or click to browse</p>
                 <p className="text-xs text-dim mt-4">OCR enabled for image-based content</p>
               </div>
             ) : (
                <PdfViewer file={pdfData.file} onTextExtracted={handleTextExtracted} />
             )}
          </div>
        </section>

        {/* Right Column: Controls & Results */}
        <div className="flex flex-col gap-4 h-[85vh]">
          
          {/* Controls Card */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-lg">
             <div className="mb-2">
               <div>
                  <label className="block text-xs font-bold text-dim mb-1.5 uppercase tracking-wide">🤖 Model</label>
                  {/* Provider tabs */}
                  {(geminiKey || claudeKey) ? (
                    <>
                      {geminiKey && claudeKey && (
                        <div className="flex rounded-lg overflow-hidden border border-border mb-2 text-xs font-bold">
                          <button
                            onClick={() => { setModel('gemini-2.5-pro'); }}
                            className={`flex-1 py-1.5 transition-colors ${provider === 'gemini' ? 'bg-blue-600 text-white' : 'hover:bg-input text-muted'}`}
                          >
                            🔷 Gemini
                          </button>
                          <button
                            onClick={() => { setModel('claude-sonnet-4-6'); }}
                            className={`flex-1 py-1.5 transition-colors ${provider === 'claude' ? 'bg-purple-600 text-white' : 'hover:bg-input text-muted'}`}
                          >
                            🟣 Claude
                          </button>
                        </div>
                      )}
                      <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                      >
                        {(geminiKey && (!claudeKey || provider === 'gemini')) && (
                          <>
                            <optgroup label="🔷 Gemini 3.x (Preview)">
                              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Preview)</option>
                              <option value="gemini-3-pro-preview">Gemini 3 Pro (Preview)</option>
                              <option value="gemini-3-flash-preview">Gemini 3 Flash (Preview)</option>
                            </optgroup>
                            <optgroup label="🔷 Gemini 2.5 (Stable)">
                              <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                              <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
                            </optgroup>
                            <optgroup label="🔷 Gemini 2.0 (⚠️ Retiring Mar 2026)">
                              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                              <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</option>
                            </optgroup>
                          </>
                        )}
                        {(claudeKey && (!geminiKey || provider === 'claude')) && (
                          <>
                            <optgroup label="🟣 Claude 4.6 (Latest)">
                              <option value="claude-opus-4-6">Claude Opus 4.6</option>
                              <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
                            </optgroup>
                            <optgroup label="🟣 Claude 4.5">
                              <option value="claude-opus-4-5">Claude Opus 4.5</option>
                              <option value="claude-sonnet-4-5">Claude Sonnet 4.5</option>
                              <option value="claude-haiku-4-5">Claude Haiku 4.5</option>
                            </optgroup>
                            <optgroup label="🟣 Claude 4.1 / 4.0">
                              <option value="claude-opus-4-1">Claude Opus 4.1</option>
                              <option value="claude-sonnet-4-0">Claude Sonnet 4.0</option>
                              <option value="claude-opus-4-0">Claude Opus 4.0</option>
                            </optgroup>
                            <optgroup label="🟣 Claude 3.7 / 3.0">
                              <option value="claude-3-7-sonnet-20250219">Claude 3.7 Sonnet</option>
                              <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                            </optgroup>
                          </>
                        )}
                      </select>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-[11px] text-muted bg-input rounded-lg p-3 text-center">
                        Add an API key to see available models
                      </div>
                      <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="w-full py-2 rounded-lg text-xs font-bold border border-warning/60 text-warning hover:bg-warning/10 transition-colors animate-pulse"
                      >
                        ⚠️ Add API Key
                      </button>
                    </div>
                  )}
                  {provider === 'claude' && !claudeKey && geminiKey && (
                    <p className="mt-1.5 text-[11px] text-warning flex items-center gap-1">
                      ⚠️ Claude API Key required —{' '}
                      <button onClick={() => setIsSettingsOpen(true)} className="underline hover:text-text transition-colors">add key</button>
                    </p>
                  )}
                  {provider === 'gemini' && !geminiKey && claudeKey && (
                    <p className="mt-1.5 text-[11px] text-warning flex items-center gap-1">
                      ⚠️ Gemini API Key required —{' '}
                      <button onClick={() => setIsSettingsOpen(true)} className="underline hover:text-text transition-colors">add key</button>
                    </p>
                  )}
               </div>
             </div>
          </div>

          {/* Status Card */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-lg">
             <div className="flex items-center gap-3 bg-input px-4 py-3 rounded-lg">
               <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  status === 'loading' || status === 'ocr' || status === 'analyzing' ? 'bg-warning animate-pulse' :
                  status === 'complete' ? 'bg-success' : 
                  status === 'error' ? 'bg-danger' : 'bg-muted'
               }`}></div>
               <span className="text-sm font-medium flex-1 truncate">{statusText}</span>
               {(status === 'idle' || status === 'complete' || status === 'error') && (
                 <button onClick={startAnalysis} className="text-xs bg-primary text-white px-3 py-1.5 rounded font-bold hover:bg-blue-600 transition-colors">
                    {status === 'idle' ? 'START 🚀' : 'RESTART 🚀'}
                 </button>
               )}
             </div>
             {(status === 'loading' || status === 'ocr' || status === 'analyzing') && (
               <div className="mt-3">
                  <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-red-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="flex justify-between mt-1">
                      <span className="text-[10px] font-mono text-muted">{Math.round(progress)}%</span>
                  </div>
               </div>
             )}
          </div>

          {/* Results & Chat Tabs */}
          <div className="bg-card border border-border rounded-xl flex-1 flex flex-col overflow-hidden shadow-lg">
            <div className="flex border-b border-border bg-card/50">
              <button 
                onClick={() => setActiveTab('results')}
                className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'results' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted hover:text-text hover:bg-white/5'}`}
              >
                📊 Analysis Results
              </button>
              <button 
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'chat' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted hover:text-text hover:bg-white/5'}`}
              >
                💬 Chat Assistant
              </button>
            </div>

            <div className="flex-1 overflow-hidden relative">
              {activeTab === 'results' ? (
                <div className="absolute inset-0 flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    <VariableCard 
                      label="V1. Location of Statement" 
                      range="1-5" 
                      desc="Where is GenAI use reported?"
                      data={results?.v1} 
                    />
                    <VariableCard 
                      label="V2. Tool Specificity" 
                      range="1-5" 
                      desc="Which tool was used and how specifically?"
                      data={results?.v2} 
                    />
                    <VariableCard 
                      label="V3. Purpose of Use" 
                      range="0-5" 
                      desc="What was GenAI used for?"
                      data={results?.v3} 
                    />
                    <VariableCard 
                      label="V4. Prompt Disclosure" 
                      range="0-5" 
                      desc="Were prompts or instructions shared?"
                      data={results?.v4} 
                    />
                    <VariableCard 
                      label="V5. Human Verification" 
                      range="0-5" 
                      desc="Did humans verify or validate outputs?"
                      data={results?.v5} 
                    />
                    <VariableCard 
                      label="V6. Limitation Acknowledgment" 
                      range="0-5" 
                      desc="Were limitations/risks acknowledged?"
                      data={results?.v6} 
                    />

                    {results?.found_genai_disclosure === false && (
                      <div className="bg-warning/10 border border-warning/40 rounded-xl p-5 text-center mt-2 animate-in fade-in duration-500">
                        <div className="text-3xl mb-2">🔍</div>
                        <div className="font-bold text-warning text-sm mb-1">No GenAI Disclosure Found</div>
                        <div className="text-xs text-muted leading-relaxed">
                          The article contains no author self-declaration of GenAI use.<br/>
                          Per Protocol Rule 4: coding is based on author self-declaration only.
                        </div>
                      </div>
                    )}

                    {results?.warnings && results.warnings.length > 0 && (
                      <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 animate-in fade-in duration-500">
                        <div className="text-xs font-bold text-warning mb-2 flex items-center gap-1">⚠️ Coding Notes</div>
                        <ul className="space-y-1">
                          {results.warnings.map((w, i) => (
                            <li key={i} className="text-[11px] text-muted leading-relaxed flex items-start gap-1.5">
                              <span className="text-warning mt-0.5">•</span>{w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {results?.total_score != null && (
                      <div className="bg-gradient-to-br from-blue-600 to-red-600 rounded-xl p-6 text-center text-white mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                          <div className="text-sm opacity-90 mb-1">Total Transparency Score</div>
                          <div className="text-5xl font-bold tracking-tight mb-2">{results.total_score}</div>
                          <div className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-bold backdrop-blur-sm">
                              {results.category} Transparency
                          </div>
                          {results.overall_confidence && (
                            <div className="mt-3">
                              <span className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-bold backdrop-blur-sm ${
                                results.overall_confidence === 'HIGH' ? 'bg-green-500/30 text-green-100' :
                                results.overall_confidence === 'MEDIUM' ? 'bg-yellow-500/30 text-yellow-100' :
                                'bg-red-500/30 text-red-100'
                              }`}>
                                Overall Confidence: {results.overall_confidence}
                              </span>
                            </div>
                          )}
                      </div>
                    )}

                    {results && (
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-2 border-t border-border">
                          <button onClick={handleExportJSON} className="btn-outline text-xs py-2">📄 JSON</button>
                          <button onClick={handleExportCSV} className="btn-outline text-xs py-2">📊 CSV</button>
                          <button 
                              onClick={() => {
                                  const text = `GenAI Transparency Coding\nFile: ${pdfData?.file.name}\nTotal: ${results.total_score}\nCategory: ${results.category}`;
                                  navigator.clipboard.writeText(text);
                                  addToast('Copied to clipboard', 'success');
                              }} 
                              className="btn-outline text-xs py-2"
                          >
                              📋 Copy
                          </button>
                          <button onClick={handleExportReport} className="btn-primary text-xs py-2 bg-primary text-white hover:bg-blue-600">📑 Report</button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col">
                  {pdfData ? (
                    <ChatInterface
                      documentText={(pdfData.extractedText || '') + '\n' + (pdfData.ocrText || '')}
                      model={model}
                      apiKey={activeKey}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted p-8 text-center">
                      <div className="text-4xl mb-4">📄</div>
                      <p>Please upload a document to start chatting.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Overlays */}
      <ProtocolModal isOpen={isProtocolOpen} onClose={() => setIsProtocolOpen(false)} />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveGemini={handleSaveGeminiKey}
        onSaveClaude={handleSaveClaudeKey}
        currentGeminiKey={geminiKey}
        currentClaudeKey={claudeKey}
      />
      
      {/* Loading Overlay for heavy operations */}
      {(status === 'ocr' || status === 'analyzing') && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="text-center p-8 bg-card border border-border rounded-2xl shadow-2xl max-w-sm w-full mx-4">
                <div className="w-12 h-12 border-4 border-input border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-bold mb-1">{statusText}</h3>
                <p className="text-sm text-muted">This may take a minute...</p>
                <div className="mt-4 text-xs font-mono text-dim">{Math.round(progress)}% Complete</div>
            </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
            <div key={t.id} className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-lg shadow-2xl border-l-4 animate-in slide-in-from-right duration-300 bg-card border border-border ${
                t.type === 'success' ? 'border-l-success' :
                t.type === 'error' ? 'border-l-danger' :
                t.type === 'warning' ? 'border-l-warning' : 'border-l-primary'
            }`}>
                <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : t.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                <span className="text-sm font-medium">{t.message}</span>
            </div>
        ))}
      </div>
      
    </div>
  );
}

const VariableCard: React.FC<{
  label: string;
  range: string;
  desc: string;
  data?: TransparencyVar;
}> = ({ label, range, desc, data }) => {
    const hasData = data && data.score !== null;
    const isNotFound = data && data.score === null;

    return (
        <div className={`p-4 rounded-xl border transition-all duration-200 ${
            hasData ? 'bg-input/50 border-success/30 hover:border-success/60' : 
            isNotFound ? 'bg-input/30 border-warning/30 hover:border-warning/60' :
            'bg-input border-transparent hover:border-border'
        }`}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="font-semibold text-sm flex items-center gap-2">
                        {label}
                        <span className="text-[10px] bg-bg px-1.5 py-0.5 rounded text-muted font-mono">{range}</span>
                        {hasData && data.confidence && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                            data.confidence === 'HIGH' ? 'bg-success/15 text-success border border-success/20' :
                            data.confidence === 'MEDIUM' ? 'bg-warning/15 text-warning border border-warning/20' :
                            'bg-danger/15 text-danger border border-danger/20'
                          }`}>{data.confidence}</span>
                        )}
                    </div>
                    <div className="text-xs text-dim mt-0.5">{desc}</div>
                </div>
                <div className={`text-xl font-mono font-bold ${
                    hasData ? 'text-primary' :
                    isNotFound ? 'text-warning text-sm mt-1' : 'text-muted/50'
                }`}>
                    {hasData ? data.score : isNotFound ? 'N/F' : '—'}
                </div>
            </div>
            {(hasData || isNotFound) && (
                <div className="mt-3 pt-3 border-t border-border/50 text-xs space-y-3 animate-in fade-in duration-500">
                    <div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">Analysis (EN)</span>
                        <p className="text-dim leading-relaxed whitespace-pre-wrap">{data.explanation_en}</p>
                    </div>
                    {data.explanation_tr && (
                        <div>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">Analiz (TR)</span>
                            <p className="text-dim leading-relaxed italic whitespace-pre-wrap">{data.explanation_tr}</p>
                        </div>
                    )}
                    {data.quote && (
                         <div className="bg-bg/50 p-2.5 rounded border-l-2 border-success mt-2">
                             <div className="text-[9px] text-muted uppercase mb-1">Source Quote</div>
                             <p className="font-mono text-[11px] text-success/90 break-words leading-relaxed">"{data.quote}"</p>
                             {data.location && <div className="text-[10px] text-muted mt-2 text-right">📍 {data.location}</div>}
                         </div>
                    )}
                </div>
            )}
        </div>
    );
};