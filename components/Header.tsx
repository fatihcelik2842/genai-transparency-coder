import React from 'react';

interface HeaderProps {
  onOpenProtocol: () => void;
  onUploadClick: () => void;
  onOpenSettings: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenProtocol, onUploadClick, onOpenSettings, hasApiKey }) => {
  return (
    <header className="bg-card border-b border-border px-6 py-4 flex justify-between items-center flex-wrap gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-red-500 rounded-lg flex items-center justify-center text-xl shadow-lg">
          📊
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight">GenAI Transparency Coder</h1>
          <span className="text-xs text-muted uppercase tracking-wider font-medium flex items-center gap-2">
            Protocol v2.0 • 
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-br from-blue-600 to-red-600 rounded text-[10px] text-white font-bold">
              🔷 Powered by Gemini
            </span>
          </span>
        </div>
      </div>
      <div className="flex gap-3 items-center flex-wrap">
        <button
          onClick={onOpenSettings}
          className={`px-4 py-2 rounded-lg font-semibold text-sm border transition-colors flex items-center gap-2 ${
            hasApiKey
              ? 'border-success/40 text-success hover:bg-success/10'
              : 'border-warning/60 text-warning hover:bg-warning/10 animate-pulse'
          }`}
          title={hasApiKey ? 'API Key is set' : 'No API Key — click to configure'}
        >
          {hasApiKey ? '🔑 API Key ✓' : '⚠️ Set API Key'}
        </button>
        <button
          onClick={onOpenProtocol}
          className="px-4 py-2 rounded-lg font-semibold text-sm border border-border hover:bg-input transition-colors flex items-center gap-2"
        >
          📖 Protocol
        </button>
        <button
          onClick={onUploadClick}
          className="px-4 py-2 rounded-lg font-semibold text-sm bg-gradient-to-br from-blue-500 to-blue-400 text-white hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          📄 Upload PDF
        </button>
      </div>
    </header>
  );
};