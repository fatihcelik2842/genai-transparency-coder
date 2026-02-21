import React from 'react';

interface ProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProtocolModal: React.FC<ProtocolModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center z-50 p-8" onClick={onClose}>
      <div className="bg-card rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-border" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-border flex justify-between items-center bg-card">
          <div>
            <h2 className="text-xl font-bold">📖 GenAI Transparency Protocol v2.0</h2>
            <p className="text-xs text-muted mt-1">Revised February 2026 • Based on Expert Panel Review</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-danger hover:border-danger hover:text-white transition-colors text-xl leading-none">
            ×
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-8 text-sm">
          
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg space-y-2">
            <h3 className="text-primary font-bold text-sm uppercase tracking-wider mb-3">General Coding Rules</h3>
            <Rule num="1" text="MULTIPLE LOCATIONS: Code the HIGHEST transparency level observed." />
            <Rule num="2" text="MULTIPLE TOOLS: Code the MOST SPECIFICALLY identified tool (and note others)." />
            <Rule num="3" text="MULTIPLE PURPOSES: Code the MOST CONSEQUENTIAL use for the research." />
            <Rule num="4" text="SELF-DECLARATION: Code based on author self-declaration only." />
          </div>

          <Section title="V1. Location of Statement (1-5)" question="Where is GenAI use reported?">
             <Item code="1" text="Footnotes / Brief Notes" desc="Footnote, First page note, Author notes, Parenthetical mention" />
             <Item code="2" text="Standard End Sections" desc="Acknowledgments, Statement, Disclosure sections" />
             <Item code="3" text="Formal GenAI Declaration" desc="Dedicated GenAI declaration section with specific heading" />
             <Item code="4" text="Main Text Integration" desc="Methodology, Data Analysis, Results, Findings" />
             <Item code="5" text="Full Transparency + Evidence" desc="Appendix, Supplementary Material, Web Appendix with evidence" />
          </Section>

          <Section title="V2. Tool Specificity (1-5)" question="Which tool was used and how specifically was it identified?">
            <Item code="1" text="Generic Terms Only" desc="LLM, Generative AI, GenAI, AI tool (No brand)" />
            <Item code="2" text="Brand/Model Name" desc="ChatGPT, Gemini, Claude (No version)" />
            <Item code="3" text="Version Number" desc="ChatGPT 4.0, GPT-3.5, ChatGPT 4o, Claude 3" />
            <Item code="4" text="Version + Access Date" desc="Version plus specific access date" />
            <Item code="5" text="Technical Identifier / API" desc="gpt-4o-2024-05-13, custom GPT links" />
          </Section>

          <Section title="V3. Purpose of Use (0-5)" question="What was GenAI used for in the research process?">
            <Item code="0" text="No Specific Action" desc="Generic 'used/employed' only, no action verb" />
            <Item code="1" text="Language Editing (Passive)" desc="Grammar, spelling, polish, readability, flow" />
            <Item code="2" text="Writing Support (Active)" desc="Paraphrasing, summarizing, rewriting, restructuring" />
            <Item code="3" text="Content/Stimuli Generation" desc="Scenarios, images, ads, stimuli, survey items" />
            <Item code="4" text="Analytic/Technical Tasks" desc="Classification, sentiment analysis, coding" />
            <Item code="5" text="Methodological Integration" desc="Synthetic data, simulated participants, core method" />
          </Section>

          <Section title="V4. Prompt Disclosure (0-5)" question="Were prompts or instructions shared?">
            <Item code="0" text="No Prompt Information" desc="Or 'improved readability' only" />
            <Item code="1" text="General Statement" desc="'Prompts were given' (no examples)" />
            <Item code="2" text="Single Example" desc="One quoted command or single summarized prompt" />
            <Item code="3" text="Multiple Examples" desc="Two or more distinct prompt examples" />
            <Item code="4" text="Prompt + Rationale" desc="Prompts plus explanation of design logic/strategy" />
            <Item code="5" text="Complete Prompt Archive" desc="Full sequence in appendix or accessible link" />
          </Section>

          <Section title="V5. Human Verification (0-5)" question="Did humans verify, review, or validate outputs?">
            <Item code="0" text="No Statement" desc="No mention of verification" />
            <Item code="1" text="General Statement" desc="Passive 'outputs were checked'" />
            <Item code="2" text="Author-Specific Statement" desc="'The authors reviewed and edited...'" />
            <Item code="3" text="Procedural Detail" desc="Specific method (line-by-line) or threshold" />
            <Item code="4" text="Multiple Verification Methods" desc="Two or more approaches (e.g., Authors + External)" />
            <Item code="5" text="Systematic Validation" desc="Comparison with human benchmark, stats agreement" />
          </Section>

          <Section title="V6. Limitation Acknowledgment (0-5)" question="Were limitations, risks, or biases acknowledged?">
            <Item code="0" text="No Information" desc="No mention of risk/error" />
            <Item code="1" text="General Warning" desc="'AI can make mistakes', 'not perfect'" />
            <Item code="2" text="Specific Limitation Type" desc="Hallucination, bias, specific error type" />
            <Item code="3" text="Tool-Specific Limitation" desc="Specific model/tool paired with limitation" />
            <Item code="4" text="Research Impact Statement" desc="How limitation impacted THIS study" />
            <Item code="5" text="Comprehensive Risk Analysis" desc="Extended discussion (ethics, privacy, validity)" />
          </Section>
          
          <div className="bg-card border border-border p-5 rounded-xl">
             <h3 className="text-primary font-bold mb-3 text-sm uppercase">Total Score Interpretation</h3>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-bg p-3 rounded border border-border flex flex-col gap-1">
                  <span className="font-mono text-lg font-bold text-primary">2-12</span>
                  <span className="font-bold">Low Transparency</span>
                  <span className="text-muted">Minimal disclosure, reproducibility concerns.</span>
                </div>
                <div className="bg-bg p-3 rounded border border-border flex flex-col gap-1">
                  <span className="font-mono text-lg font-bold text-primary">13-21</span>
                  <span className="font-bold">Moderate Transparency</span>
                  <span className="text-muted">Partial disclosure, some gaps remain.</span>
                </div>
                <div className="bg-bg p-3 rounded border border-border flex flex-col gap-1">
                  <span className="font-mono text-lg font-bold text-primary">22-30</span>
                  <span className="font-bold">High Transparency</span>
                  <span className="text-muted">Comprehensive disclosure, good reproducibility.</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; question?: string; children: React.ReactNode }> = ({ title, question, children }) => (
  <div>
    <div className="mb-3">
      <h3 className="text-primary font-bold text-base">{title}</h3>
      {question && <p className="text-muted italic text-xs">{question}</p>}
    </div>
    <div className="grid gap-2">{children}</div>
  </div>
);

const Item: React.FC<{ code: string; text: string; desc: string }> = ({ code, text, desc }) => (
  <div className="flex gap-4 px-4 py-3 bg-input/50 border border-transparent hover:border-border rounded-lg items-center transition-colors">
    <span className="font-mono font-bold text-primary text-lg min-w-[24px] text-center">{code}</span>
    <div className="flex-1">
      <div className="font-semibold text-text">{text}</div>
      <div className="text-dim text-xs">{desc}</div>
    </div>
  </div>
);

const Rule: React.FC<{ num: string; text: string }> = ({ num, text }) => (
  <div className="flex gap-2 text-xs text-text/90">
    <span className="font-bold text-primary">RULE {num}:</span>
    <span>{text}</span>
  </div>
);