import React, { useState, useRef, useEffect } from 'react';
import { chatWithDocument } from '../services/geminiService';
import { chatWithDocumentClaude } from '../services/claudeService';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatInterfaceProps {
  documentText: string;
  model: string;
  apiKey: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ documentText, model, apiKey }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      let response: string | undefined;

      if (model.startsWith('claude')) {
        // Claude uses role:'assistant' instead of 'model'
        const history = messages.map(m => ({
          role: (m.role === 'model' ? 'assistant' : 'user') as 'user' | 'assistant',
          content: m.text
        }));
        response = await chatWithDocumentClaude(model, documentText, history, userMessage, apiKey);
      } else {
        const history = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));
        response = await chatWithDocument(model, documentText, history, userMessage, apiKey);
      }

      setMessages(prev => [...prev, { role: 'model', text: response || 'No response' }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getModelName = (m: string) => {
    const names: Record<string, string> = {
      // Gemini 2.5
      'gemini-2.5-pro': 'Gemini 2.5 Pro',
      'gemini-2.5-flash': 'Gemini 2.5 Flash',
      'gemini-2.5-flash-lite': 'Gemini 2.5 Flash Lite',
      // Gemini 2.0
      'gemini-2.0-flash': 'Gemini 2.0 Flash',
      'gemini-2.0-flash-lite': 'Gemini 2.0 Flash Lite',
      // Gemini 1.5
      'gemini-1.5-pro': 'Gemini 1.5 Pro',
      'gemini-1.5-flash': 'Gemini 1.5 Flash',
      'gemini-1.5-flash-8b': 'Gemini 1.5 Flash 8B',
      // Claude 4.6
      'claude-opus-4-6': 'Claude Opus 4.6',
      'claude-sonnet-4-6': 'Claude Sonnet 4.6',
      // Claude 4.5
      'claude-opus-4-5': 'Claude Opus 4.5',
      'claude-sonnet-4-5': 'Claude Sonnet 4.5',
      'claude-haiku-4-5': 'Claude Haiku 4.5',
      // Claude 4.1 / 4.0
      'claude-opus-4-1': 'Claude Opus 4.1',
      'claude-sonnet-4-0': 'Claude Sonnet 4.0',
      'claude-opus-4-0': 'Claude Opus 4.0',
      // Claude 3.7 / 3.0
      'claude-3-7-sonnet-20250219': 'Claude 3.7 Sonnet',
      'claude-3-haiku-20240307': 'Claude 3 Haiku',
    };
    return names[m] ?? m;
  };

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      <div className="p-4 border-b border-border font-bold text-sm bg-card/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <span>💬 Protocol Assistant</span>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                {getModelName(model)}
            </span>
        </div>
        <span className="text-xs text-muted font-normal hidden sm:inline">Ask about the protocol or document</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-bg/50">
        {messages.length === 0 && (
          <div className="text-center text-muted text-sm mt-8 px-4">
            <div className="mb-2 text-2xl">👋</div>
            <p>Hi! I'm your coding assistant.</p>
            <p className="mt-1">I know the full transparency protocol and have read the document.</p>
            <p className="mt-4 text-xs text-dim">Try asking:</p>
            <ul className="text-xs text-dim mt-2 space-y-1">
              <li>"Does this article mention specific prompts?"</li>
              <li>"How should I code V3 if they used it for editing?"</li>
              <li>"Is there a limitations section?"</li>
            </ul>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-br-none' 
                : 'bg-input text-text rounded-bl-none border border-border'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-input text-text rounded-lg rounded-bl-none border border-border px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-dim rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-dim rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-dim rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-border bg-card">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-primary text-white p-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
