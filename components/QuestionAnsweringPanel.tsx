
import React, { useState, useRef, useEffect } from 'react';
import { getIslamicAnswerStream, getQiyasAnalysis, shouldPerformQiyas, performSSLAudit, extractTextFromImage } from '../services/geminiService';
import { refineUserQuery } from '../services/queryIntelligenceService';
import { addQASession } from '../services/historyService';
import { 
    LoaderIcon, SendIcon, LightbulbIcon, GlobeIcon, IslamicStarIcon, 
    BookOpenCheckIcon, CheckIcon, BrainCircuitIcon, DatabaseIcon, 
    PenToolIcon, ScanIcon, ScaleIcon, ArrowRightIcon, UserIcon, ShieldCheckIcon
} from './icons';
import { FeedbackWidget } from './FeedbackWidget';
import { QueryIntelligenceCard } from './QueryIntelligenceCard';
import { SSLAuditPanel } from './SSLAuditPanel';
import type { QiyasAnalysis, QASession, GroundingChunk, AgentLog, QueryRefinement, SSLAuditResult } from '../types';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface QuestionAnsweringPanelProps {
  language: 'en' | 'ar' | 'ur';
  onCitationClick: (citation: string) => void;
  onHistoryUpdate: () => void;
  initialSession: QASession | null;
  onSessionLoaded: () => void;
}

const QiyasAnalysisDisplay: React.FC<{ analysis: QiyasAnalysis }> = ({ analysis }) => {
    // Defensive check for partial data
    if (!analysis?.asl || !analysis?.far || !analysis?.illah || !analysis?.hukm) {
        return null;
    }

    return (
        <div className="mt-6 p-5 border border-[var(--border-subtle)] rounded-xl bg-black/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover:opacity-10 transition-opacity">
                <LightbulbIcon className="w-16 h-16" />
            </div>
            <h3 className="text-xs font-bold text-[var(--accent-gold)] mb-4 flex items-center gap-2 uppercase tracking-widest">
                <BrainCircuitIcon className="w-3 h-3" />
                Analogical Engine (Qiyas)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm relative z-10">
                <div className="space-y-4">
                    <div className="pl-3 border-l-2 border-[var(--accent-gold)]/50">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Root (Asl)</span>
                        <p className="text-slate-300 font-medium">{analysis.asl.case}</p>
                    </div>
                    <div className="pl-3 border-l-2 border-[var(--accent-sage)]/50">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Branch (Far')</span>
                        <p className="text-slate-300 font-medium">{analysis.far.case}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="pl-3 border-l-2 border-white/20">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Cause ('Illah)</span>
                        <p className="text-slate-300 font-medium">{analysis.illah.cause}</p>
                    </div>
                    <div className="pl-3 border-l-2 border-[var(--accent-gold)] bg-[var(--accent-gold)]/5 p-2 rounded-r-lg">
                        <span className="text-[10px] font-bold text-[var(--accent-gold)] uppercase block mb-1">Ruling (Hukm)</span>
                        <p className="text-[var(--accent-gold)] font-serif text-lg leading-none">{analysis.hukm.ruling}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EmptyState: React.FC<{ onPromptClick: (prompt: string) => void }> = ({ onPromptClick }) => {
    const prompts = [
        "Ruling on cryptocurrency trading?",
        "Is AI-generated art permissible?",
        "Islamic guidelines for freelancing",
        "Fiqh of dropshipping",
    ];
    return (
        <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto px-4">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 shadow-2xl border border-white/10">
                <IslamicStarIcon className="w-8 h-8 text-[var(--accent-gold)]" />
            </div>
            <h2 className="text-2xl font-medium text-white mb-2">Ijtihad Intelligence</h2>
            <p className="text-slate-500 text-sm mb-10 max-w-md">
                Advanced jurisprudential analysis backed by classical texts and verified reasoning chains.
            </p>
            <div className="grid grid-cols-2 gap-3 w-full">
                {prompts.map(p => (
                    <button key={p} onClick={() => onPromptClick(p)} className="p-4 text-left bg-[#18181b] border border-white/5 rounded-xl hover:bg-[#27272a] hover:border-white/10 transition-all text-sm text-slate-300">
                        {p}
                    </button>
                ))}
            </div>
        </div>
    );
};

export const QuestionAnsweringPanel: React.FC<QuestionAnsweringPanelProps> = ({ language, onCitationClick, onHistoryUpdate, initialSession, onSessionLoaded }) => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string, components?: any}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState(''); // Stream buffer
  const [currentWebSources, setCurrentWebSources] = useState<GroundingChunk[]>([]);
  const [currentSSLAudit, setCurrentSSLAudit] = useState<SSLAuditResult | null>(null);
  const [currentQiyas, setCurrentQiyas] = useState<QiyasAnalysis | null>(null);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  
  // Intelligence States
  const [isIntelligenceLoading, setIsIntelligenceLoading] = useState(false);
  const [refinement, setRefinement] = useState<QueryRefinement | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialSession) {
        setMessages([
            { role: 'user', content: initialSession.question },
            { role: 'ai', content: initialSession.answer } // We load historic answer as static content
        ]);
        setQuestion('');
        onSessionLoaded();
    }
  }, [initialSession, onSessionLoaded]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentAnswer, agentLogs]);

  // Auto-resize textarea
  useEffect(() => {
    if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
        textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
    }
  }, [question]);

  const handleRefine = async () => {
    if (!question.trim() || isIntelligenceLoading) return;
    setIsIntelligenceLoading(true);
    setRefinement(null);
    try {
        const result = await refineUserQuery(question);
        setRefinement(result);
    } catch (err) {
        console.error("Refinement failed", err);
    } finally {
        setIsIntelligenceLoading(false);
    }
  };

  const handleOcrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsOcrProcessing(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
          if (event.target?.result) {
              const base64 = event.target.result as string;
              try {
                  const text = await extractTextFromImage(base64);
                  if (text) setQuestion(text);
              } catch (err) {
                  console.error("OCR failed");
              } finally {
                  setIsOcrProcessing(false);
              }
          }
      };
      reader.readAsDataURL(file);
  };

  const handleSubmit = async (e?: React.FormEvent, prompt?: string) => {
    if (e) e.preventDefault();
    const input = prompt || question;
    if (!input.trim() || isLoading) return;

    // Reset current stream states
    setIsLoading(true);
    setCurrentAnswer('');
    setCurrentWebSources([]);
    setCurrentSSLAudit(null);
    setCurrentQiyas(null);
    setAgentLogs([]);
    setRefinement(null);
    setQuestion('');
    if (textAreaRef.current) textAreaRef.current.style.height = 'auto';

    // Add User Message
    setMessages(prev => [...prev, { role: 'user', content: input }]);

    try {
      let fullAnswer = "";
      const stream = getIslamicAnswerStream(input, language, useWebSearch);
      
      for await (const chunk of stream) {
          if (chunk.type === 'text') {
              fullAnswer += chunk.payload;
              setCurrentAnswer(fullAnswer);
          } else if (chunk.type === 'groundingMetadata') {
              setCurrentWebSources(chunk.payload.groundingChunks || []);
          } else if (chunk.type === 'agent_log') {
              setAgentLogs(prev => [...prev, chunk.payload]);
          }
      }
      
      const citationRegex = /\[((?:Quran|Sahih al-Bukhari|Sahih Muslim|Sunan Abi Dawud|Jami` at-Tirmidhi|Sunan Ibn Majah|Fiqh Councils Statement|Al-Kasani, Bada'i' al-Sana'i|[^\]]+?)\s*[\d\s:,-]+)\]/g;
      const linkedAnswer = fullAnswer.replace(citationRegex, (match, citation) => {
          const cleanCitation = citation.trim();
          return `[${cleanCitation}](?citation=${encodeURIComponent(cleanCitation)})`;
      });

      // Persist the AI response to the message history
      setMessages(prev => [...prev, { role: 'ai', content: linkedAnswer }]);

      // Perform parallel tasks
      performSSLAudit(input, fullAnswer).then(audit => {
          if(audit) setCurrentSSLAudit(audit);
          if (audit?.status === 'Verified' || audit?.confidenceScore > 70) {
             addQASession({ question: input, answer: linkedAnswer });
             onHistoryUpdate();
          }
      });

      if(!useWebSearch) {
          shouldPerformQiyas(input).then(needs => {
              if(needs) getQiyasAnalysis(input, fullAnswer, language).then(res => setCurrentQiyas(res));
          });
      }

    } catch (err) {
      console.error(err);
      const errorMsg = "\n\n**Error:** The request could not be completed.";
      setCurrentAnswer(prev => prev + errorMsg);
      setMessages(prev => [...prev, { role: 'ai', content: currentAnswer + errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderers = {
    a: ({node, ...props}: any) => {
        if (props.href && props.href.startsWith('?citation=')) {
            const citation = decodeURIComponent(props.href.substring('?citation='.length));
            return (
                <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); onCitationClick(citation); }} 
                    className="text-[var(--accent-gold)] hover:text-white inline-flex items-center gap-1 mx-0.5 font-medium no-underline hover:underline"
                >
                    <BookOpenCheckIcon className="w-3 h-3" />
                    {props.children}
                </a>
            )
        }
        return <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline" />
    }
  }

  return (
    <div className="flex flex-col h-full relative">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 pb-32 scroll-smooth">
        {messages.length === 0 && !refinement && (
            <div className="h-full flex flex-col justify-center">
                <EmptyState onPromptClick={(p) => handleSubmit(undefined, p)} />
            </div>
        )}

        {/* Refinement Card Interjection */}
        {refinement && (
            <div className="max-w-3xl mx-auto mb-8">
                <QueryIntelligenceCard 
                    refinement={refinement} 
                    onApply={(refined) => handleSubmit(undefined, refined)} 
                    onDiscard={() => setRefinement(null)} 
                    isLoading={isLoading} 
                />
            </div>
        )}

        {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 mb-8 max-w-3xl mx-auto ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-[var(--accent-gold)] flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-[var(--accent-gold)]/20">
                        <IslamicStarIcon className="w-5 h-5 text-black" />
                    </div>
                )}
                
                <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {msg.role === 'user' ? (
                        <div className="bg-[#27272a] text-white px-5 py-3 rounded-2xl rounded-tr-sm">
                            {msg.content}
                        </div>
                    ) : (
                        <div className="prose prose-invert prose-p:leading-relaxed prose-li:text-slate-300 w-full parchment-unfurl origin-top">
                            <Markdown remarkPlugins={[remarkGfm]} components={renderers}>{msg.content}</Markdown>
                        </div>
                    )}
                </div>

                {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center shrink-0 mt-1">
                        <UserIcon className="w-4 h-4 text-slate-400" />
                    </div>
                )}
            </div>
        ))}

        {/* Current Streaming Response */}
        {isLoading && (
            <div className="flex gap-4 mb-8 max-w-3xl mx-auto">
                <div className="w-8 h-8 rounded-full bg-[var(--accent-gold)] flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-[var(--accent-gold)]/20 animate-pulse">
                    <IslamicStarIcon className="w-5 h-5 text-black" />
                </div>
                <div className="w-full">
                    {/* Agent Thinking Logs */}
                    {agentLogs.length > 0 && (
                        <div className="mb-4 space-y-2">
                            {(agentLogs || []).map((log, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-slate-500 font-mono animate-fade-in-down">
                                    <span className="w-1.5 h-1.5 bg-slate-600 rounded-full"></span>
                                    <span className="font-bold">{log.agent}:</span> {log.message}
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {currentAnswer ? (
                        <div className="prose prose-invert prose-p:leading-relaxed parchment-unfurl">
                            <Markdown remarkPlugins={[remarkGfm]} components={renderers}>{currentAnswer}</Markdown>
                        </div>
                    ) : (
                        <div className="flex gap-1 mt-3">
                            <span className="w-2 h-2 bg-slate-600 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-slate-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-2 h-2 bg-slate-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Post-Response Components */}
        {!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'ai' && (
            <div className="max-w-3xl mx-auto pl-12 pr-4 space-y-4 mb-12 animate-fade-in-down delay-500">
                {currentSSLAudit && <SSLAuditPanel audit={currentSSLAudit} />}
                {currentQiyas && <QiyasAnalysisDisplay analysis={currentQiyas} />}
                {/* Defensive check for currentWebSources being an array and having items */}
                {(currentWebSources || []).length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {(currentWebSources || []).filter(s => s.web?.uri && s.web?.title).slice(0,3).map((s, i) => (
                            <a key={i} href={s.web!.uri} target="_blank" className="flex items-center gap-2 text-xs bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg border border border-white/5 transition-colors max-w-[200px] truncate">
                                <GlobeIcon className="w-3 h-3 text-slate-500" />
                                <span className="text-slate-300 truncate">{s.web!.title}</span>
                            </a>
                        ))}
                    </div>
                )}
                <div className="pt-4">
                    <FeedbackWidget query={messages[messages.length - 2]?.content} response={messages[messages.length - 1].content} category="QA" />
                </div>
            </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area (Fixed Bottom) */}
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[var(--bg-deep)] via-[var(--bg-deep)] to-transparent pt-10 pb-6 px-4">
        <div className="max-w-3xl mx-auto relative group">
            <div className={`absolute inset-0 bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-blue)] rounded-2xl opacity-0 transition-opacity duration-300 ${isIntelligenceLoading ? 'opacity-20 blur-md animate-pulse' : 'group-focus-within:opacity-10 blur-sm'}`}></div>
            <div className="relative bg-[#18181b] border border-[var(--border-subtle)] rounded-2xl shadow-2xl flex flex-col transition-colors group-focus-within:border-[var(--border-highlight)]">
                <textarea
                    ref={textAreaRef}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (question.length > 10 && question.length < 50) handleSubmit();
                            else if(question.length >= 50) handleRefine();
                            else handleSubmit();
                        }
                    }}
                    placeholder={language === 'ar' ? 'اسأل أي سؤال فقهي...' : 'Ask a question or describe a scenario...'}
                    className="w-full bg-transparent border-none p-4 text-[var(--text-primary)] placeholder-slate-500 focus:ring-0 resize-none max-h-[200px] overflow-y-auto outline-none"
                    rows={1}
                    disabled={isLoading || isIntelligenceLoading}
                    dir={language === 'ar' || language === 'ur' ? 'rtl' : 'ltr'}
                />
                <div className="flex justify-between items-center px-3 pb-3">
                    <div className="flex items-center gap-2">
                        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg transition-colors" title="Scan Manuscript">
                            {isOcrProcessing ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <ScanIcon className="w-4 h-4" />}
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleOcrUpload} accept="image/*" className="hidden" />
                        
                        <button 
                            onClick={() => setUseWebSearch(!useWebSearch)} 
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${useWebSearch ? 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] border-[var(--accent-blue)]/20' : 'bg-transparent text-slate-500 border-transparent hover:bg-white/5'}`}
                        >
                            <GlobeIcon className="w-3 h-3" />
                            <span>Web</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        {question.length > 30 && (
                            <button onClick={handleRefine} disabled={isIntelligenceLoading} className="text-xs text-[var(--accent-gold)] font-bold px-3 py-1.5 hover:bg-[var(--accent-gold)]/10 rounded-lg transition-colors flex items-center gap-1">
                                {isIntelligenceLoading ? <LoaderIcon className="w-3 h-3 animate-spin" /> : <BrainCircuitIcon className="w-3 h-3" />}
                                Refine
                            </button>
                        )}
                        <button 
                            onClick={() => handleSubmit()} 
                            disabled={!question.trim() || isLoading}
                            className={`p-2 rounded-lg transition-all ${isLoading ? 'bg-[var(--accent-gold)] wax-seal-active text-black' : (question.trim() ? 'bg-white text-black hover:bg-slate-200' : 'bg-[#27272a] text-slate-500 cursor-not-allowed')}`}
                        >
                            {isLoading ? <ShieldCheckIcon className="w-4 h-4" /> : <ArrowRightIcon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
            <p className="text-center text-[10px] text-slate-500 mt-3">
                Ijtihad AI can make mistakes. Verify with qualified scholars.
            </p>
        </div>
      </div>
    </div>
  );
};
