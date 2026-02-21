import { AnalysisResult } from '../types';
import { SYSTEM_PROMPT } from './geminiService';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export const analyzeDocumentClaude = async (
  model: string,
  text: string,
  userApiKey: string
): Promise<AnalysisResult> => {
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': userApiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      temperature: 0.1,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Analyze this academic article for GenAI transparency disclosure based on Protocol v2.0 (Revised). Provide detailed evidence and reasoning:\n\n${text.substring(0, 95000)}`
        }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message || `Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const rawText: string = data?.content?.[0]?.text || '{}';
  const cleaned = rawText.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleaned) as AnalysisResult;
};

export const chatWithDocumentClaude = async (
  model: string,
  documentText: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  message: string,
  userApiKey: string
): Promise<string> => {
  const protocolRules = SYSTEM_PROMPT.split('--- PROTOCOL START ---')[1]?.split('--- PROTOCOL END ---')[0] || '';

  const chatSystemPrompt = `You are an expert, persuasive, and highly intelligent academic coding assistant for the "GENAI TRANSPARENCY CODING PROTOCOL VERSION 2.0 (REVISED)".
  You are chatting with a user who is analyzing an academic article using this protocol.

  Your goal is to provide PERFECT, FOCUSED, CLEAR, and PERSUASIVE answers.

  STRICTLY FOLLOW THE PROTOCOL RULES.

  STYLE GUIDELINES:
  1. DO NOT use excessive bolding. Write in a natural, professional, and persuasive flow.
  2. Be authoritative and convincing. Use your knowledge of the protocol to justify your answers definitively.

  --- PROTOCOL START ---
  ${protocolRules}
  --- PROTOCOL END ---

  DOCUMENT CONTEXT:
  ${documentText.substring(0, 500000)}`;

  const messages = [
    ...history,
    { role: 'user' as const, content: message }
  ];

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': userApiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      temperature: 0.3,
      system: chatSystemPrompt,
      messages
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message || `Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data?.content?.[0]?.text || 'No response';
};
