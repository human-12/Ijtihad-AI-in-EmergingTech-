import React, { useState, useEffect, useRef } from 'react';
import { runResearchAgentPipeline } from '../services/geminiService';
import type { DeepResearchState, EvidenceObject, MadhhabPosition, ConflictNode } from '../types';
import { 
    LoaderIcon, SearchIcon, CheckIcon, ChevronDownIcon, FileTextIcon, 
    BookOpenIcon, BrainCircuitIcon, NetworkIcon, 
    GitMergeIcon, ScaleIcon, AlertTriangleIcon, LightbulbIcon,
    ShieldCheckIcon, ArrowRightIcon, XIcon, DatabaseIcon, IslamicStarIcon,
    BookOpenCheckIcon
} from './icons';
import { FeedbackWidget } from './FeedbackWidget';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ResearchAidPanelProps {
    language: 'en' | 'ar' | 'ur';
    onCitationClick: (citation: string) => void;
    onHistoryUpdate: () => void;
    initialTopic: string | null;
    onTopicSearched: () => void;
}

const AgentStatus: React.FC<{ label: string; status: 'pending' | 'active' | 'complete' | 'error' }> = ({ label, status }) => {
    return (
        <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
            status === 'active' ? 'bg-[var(--accent-gold)]/10 border-[var(--accent-gold)]/30 scale-105 shadow-lg' : 
            status === 'complete' ? 'bg-emerald-900/10 border-emerald-500/20 opacity-80' : 
            status === 'error' ? 'bg-red-900/10 border-red-500/20' :
            'bg-white/5 border-transparent opacity-40'
        }`}>
            <div className={`w-2 h-2 rounded-full ${
                status === 'active' ? 'bg-[var(--accent-gold)] animate-pulse' : 
                status === 'complete' ? 'bg-emerald-500' : 
                status === 'error' ? 'bg-red-500' : 'bg-slate-500'
            }`}></div>
            <span className={`text-xs font-bold uppercase tracking-wider ${
                status === 'active' ? 'text-[var(--accent-gold)]' : 
                status === 'error' ? 'text-red-400' : 'text-slate-400'
            }`}>
                {label}
            </span>
            {status === 'complete' && <CheckIcon className="w-4 h-4 text-emerald-500 ml-auto" />}
            {status === 'active' && <LoaderIcon className="w-4 h-4 text-[var(--accent-gold)] ml-auto animate-spin" />}
            {status === 'error' && <AlertTriangleIcon className="w-4 h-4 text-red-500 ml-auto" />}
        </div>
    );
};

const EvidenceExplorer: React.FC<{ evidence: EvidenceObject[] }> = ({ evidence }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {evidence.map((item, idx) => (
            <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-gold)] bg-[var(--accent-gold)]/10 px-2 py-0.5 rounded">
                        {item.source_type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                        Relevance: {(item.relevance_score * 100).toFixed(0)}%
                    </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{item.citation}</h4>
                <p className="text-xs text-slate-400 italic mb-2" dir="rtl">{item.original_text}</p>
                <p className="text-xs text-slate-300 leading-relaxed">{item.translation}</p>
                <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <ShieldCheckIcon className="w-3 h-3 text-[var(--accent-sage)]" />
                        <span className="text-[10px] text-slate-500">{item.authenticity_grade}</span>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const MadhhabMatrix: React.FC<{ matrix: MadhhabPosition[] }> = ({ matrix }) => (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
        <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                    <th className="px-4 py-3">Madhhab</th>
                    <th className="px-4 py-3">Position</th>
                    <th className="px-4 py-3">Evidence Basis</th>
                    <th className="px-4 py-3">Strength</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {matrix.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-bold text-[var(--accent-gold)]">{row.school}</td>
                        <td className="px-4 py-3 text-slate-300">{row.position}</td>
                        <td className="px-4 py-3 text-slate-400 italic">{row.evidence_basis}</td>
                        <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                row.strength === 'Strong' ? 'bg-[var(--accent-sage)]/20 text-[var(--accent-sage)]' : 'bg-white/10 text-slate-400'
                            }`}>
                                {row.strength}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const ConflictVisualizer: React.FC<{ conflicts: ConflictNode[] }> = ({ conflicts }) => (
    <div className="space-y-4">
        {conflicts.map((conflict, idx) => (
            <div key={idx} className="relative pl-4 border-l-2 border-red-500/30 bg-red-500/5 p-4 rounded-r-xl">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${conflict.impact_level === 'high' ? 'bg-red-500 animate-pulse' : 'bg-orange-500'}`}></div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-tight">{conflict.topic}</h4>
                </div>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">{conflict.description}</p>
                <div className="flex items-center justify-between text-[10px] font-mono">
                    <div className="flex flex-col">
                        <span className="text-slate-500 uppercase">Source A</span>
                        <span className="text-red-400">{conflict.source_a}</span>
                    </div>
                    <div className="h-px flex-1 mx-4 bg-white/10"></div>
                    <div className="flex flex-col text-right">
                        <span className="text-slate-500 uppercase">Source B</span>
                        <span className="text-red-400">{conflict.source_b}</span>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const SynthesisPanel: React.FC<{ synthesis: DeepResearchState['synthesis'] }> = ({ synthesis }) => {
    if (!synthesis) return null;
    return (
        <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-[var(--accent-gold)]/10 to-transparent border border-[var(--accent-gold)]/20 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--accent-gold)] flex items-center justify-center shadow-lg shadow-[var(--accent-gold)]/20">
                        <ScaleIcon className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <h3 className="text-lg font-serif text-[var(--accent-gold)]">Synthesized Verdict</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-[var(--accent-gold)]" style={{ width: `${synthesis.confidence_score}%` }}></div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Confidence: {synthesis.confidence_score}%</span>
                        </div>
                    </div>
                </div>
                <p className="text-white font-medium leading-relaxed mb-6">{synthesis.ruling_summary}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Reasoning Chain</h4>
                        <ul className="space-y-2">
                            {synthesis.reasoning_chain.map((step, idx) => (
                                <li key={idx} className="flex gap-3 text-xs text-slate-300">
                                    <span className="text-[var(--accent-gold)] font-bold">{idx + 1}.</span>
                                    {step}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Conditions & Caveats</h4>
                        <ul className="space-y-2">
                            {synthesis.conditions.map((cond, idx) => (
                                <li key={idx} className="flex gap-2 text-xs text-slate-400">
                                    <span className="w-1 h-1 bg-slate-600 rounded-full mt-1.5 shrink-0"></span>
                                    {cond}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ResearchAidPanel: React.FC<ResearchAidPanelProps> = ({ language, initialTopic, onTopicSearched }) => {
    const [topic, setTopic] = useState('');
    const [state, setState] = useState<DeepResearchState>({
        status: 'idle',
        currentAgent: '',
        logs: [],
        literature: [],
        evidence: [],
        conflicts: [],
        hypotheses: []
    });
    const [stepStatuses, setStepStatuses] = useState<Record<string, 'pending' | 'active' | 'complete' | 'error'>>({});
    const abortControllerRef = useRef<AbortController | null>(null);
    const logsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

    useEffect(() => {
        if (initialTopic) {
            setTopic(initialTopic);
            handleStartResearch(initialTopic);
            onTopicSearched();
        }
    }, [initialTopic]);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [state.logs]);

    const handleStartResearch = async (queryTopic: string) => {
        if (!queryTopic.trim()) return;
        
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        setState({
            status: 'active',
            currentAgent: 'Orchestrator',
            logs: ['Initiating Swarm Orchestration...'],
            literature: [],
            evidence: [],
            conflicts: [],
            hypotheses: []
        });
        setStepStatuses({});

        try {
            const pipeline = runResearchAgentPipeline(queryTopic, language, abortControllerRef.current.signal);

            for await (const update of pipeline) {
                if (update.type === 'step_start') {
                    setStepStatuses(prev => ({ ...prev, [update.step]: 'active' }));
                    setState(prev => ({ ...prev, currentAgent: update.step }));
                } else if (update.type === 'step_complete') {
                    setStepStatuses(prev => ({ ...prev, [update.step]: 'complete' }));
                } else if (update.type === 'log') {
                    setState(prev => ({ ...prev, logs: [...prev.logs, update.data] }));
                } else if (update.type === 'decomposition') {
                    setState(prev => ({ ...prev, decomposition: update.data }));
                } else if (update.type === 'literature') {
                    setState(prev => ({ ...prev, literature: update.data }));
                } else if (update.type === 'evidence') {
                    setState(prev => ({ ...prev, evidence: update.data }));
                } else if (update.type === 'madhhab_matrix') {
                    setState(prev => ({ ...prev, madhhab_matrix: update.data }));
                } else if (update.type === 'conflicts') {
                    setState(prev => ({ ...prev, conflicts: update.data }));
                } else if (update.type === 'hypotheses') {
                    setState(prev => ({ ...prev, hypotheses: update.data }));
                } else if (update.type === 'methodology') {
                    setState(prev => ({ ...prev, methodology: update.data }));
                } else if (update.type === 'synthesis') {
                    setState(prev => ({ ...prev, synthesis: update.data }));
                } else if (update.type === 'draft') {
                    setState(prev => ({ ...prev, draft: update.data, status: 'complete' }));
                } else if (update.type === 'error') {
                    setState(prev => ({ ...prev, error: update.message, status: 'idle' }));
                    setStepStatuses(prev => {
                        const next = { ...prev };
                        Object.keys(next).forEach(key => {
                            if (next[key] === 'active') next[key] = 'error';
                        });
                        return next;
                    });
                }
            }
        } catch (err: any) {
            if (err.name === 'AbortError') {
                setState(prev => ({ ...prev, status: 'idle', logs: [...prev.logs, '[System] Research cancelled.'] }));
            } else {
                setState(prev => ({ ...prev, status: 'idle', error: err.message }));
            }
        } finally {
            abortControllerRef.current = null;
        }
    };

    const handleCancel = () => {
        abortControllerRef.current?.abort();
    };

    const steps = [
        'Orchestrator: Query Decomposition', 
        'Evidence Agent: Literature Retrieval', 
        'Usul Agent: Evidence Validation', 
        'Madhhab Agent: Comparative Mapping',
        'Conflict Agent: Tension Detection', 
        'Synthesis Agent: Weighted Reasoning', 
        'Academic Agent: Final Drafting'
    ];

    return (
        <div className="max-w-[1600px] mx-auto pb-20 animate-fade-in-down px-6">
            {/* Header */}
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-display font-bold text-slate-100 flex items-center gap-3">
                        <NetworkIcon className="w-8 h-8 text-[var(--accent-gold)]" />
                        Deep Research <span className="text-[var(--accent-gold)]">Agent Swarm</span>
                    </h2>
                    <p className="text-slate-400 mt-2 text-sm max-w-2xl">
                        A multi-agent autonomous system for comprehensive jurisprudential analysis. 
                        Decomposes queries, validates evidence, detects conflicts, and synthesizes findings.
                    </p>
                </div>
                {state.status === 'active' && (
                    <button 
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-500/30 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
                    >
                        <XIcon className="w-4 h-4" /> Interrupt Swarm
                    </button>
                )}
            </header>

            {state.error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-2xl flex items-center gap-4 animate-fade-in-down">
                    <AlertTriangleIcon className="w-6 h-6 text-red-500" />
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-red-400 uppercase tracking-widest">Pipeline Error</h4>
                        <p className="text-xs text-slate-300">{state.error}</p>
                    </div>
                    <button 
                        onClick={() => setState(prev => ({ ...prev, error: undefined }))}
                        className="p-2 hover:bg-white/5 rounded-lg text-slate-500"
                    >
                        <XIcon className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Main Input */}
            {state.status === 'idle' && !state.draft ? (
                <div className="glass-panel p-12 rounded-3xl max-w-3xl mx-auto text-center border-2 border-dashed border-slate-800">
                    <BrainCircuitIcon className="w-20 h-20 text-[var(--accent-gold)] mx-auto mb-6 opacity-80" />
                    <h3 className="text-2xl font-bold text-white mb-6">Initialize Research Vector</h3>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleStartResearch(topic)}
                            placeholder="Enter complex research topic (e.g. 'Ethical implications of CRISPR in Islamic Bioethics')..."
                            className="w-full bg-black/40 border border-slate-700 rounded-2xl p-5 pr-32 text-slate-200 focus:ring-2 focus:ring-[var(--accent-gold)] outline-none text-lg"
                        />
                        <button 
                            onClick={() => handleStartResearch(topic)}
                            disabled={!topic.trim()}
                            className="absolute right-3 top-3 bottom-3 px-6 bg-[var(--accent-gold)] hover:bg-[#c9a660] text-black font-bold rounded-xl transition shadow-lg flex items-center gap-2"
                        >
                            <SearchIcon className="w-5 h-5" /> Launch
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-12 gap-8 h-[calc(100vh-200px)]">
                    
                    {/* LEFT RAIL: Agent Status & Logs */}
                    <div className="col-span-3 flex flex-col gap-4 h-full">
                        <div className="glass-panel p-5 rounded-2xl bg-black/40 border border-white/5">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Pipeline Status</h3>
                            <div className="space-y-2">
                                {steps.map((agent, i) => (
                                    <AgentStatus key={i} label={agent} status={stepStatuses[agent] || 'pending'} />
                                ))}
                            </div>
                        </div>
                        
                        <div className="glass-panel p-4 rounded-2xl flex-grow overflow-hidden flex flex-col bg-[#0a0a0a] border border-white/5 font-mono text-xs">
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">System Terminal</h3>
                            <div className="overflow-y-auto custom-scrollbar space-y-1.5 p-2">
                                {state.logs.map((log, i) => (
                                    <div key={i} className="text-slate-400">
                                        <span className="text-[var(--accent-gold)] mr-2">➜</span>
                                        {log}
                                    </div>
                                ))}
                                <div ref={logsEndRef} />
                            </div>
                        </div>
                    </div>

                    {/* CENTER: Dynamic Workspace */}
                    <div className="col-span-9 flex flex-col gap-8 overflow-y-auto custom-scrollbar pb-20">
                        
                        {/* 1. Decomposition Card */}
                        {state.decomposition && (
                            <div className="glass-panel p-8 rounded-2xl animate-slide-up-fade-in border-l-4 border-l-[var(--accent-gold)] bg-white/5">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xs font-bold text-[var(--accent-gold)] uppercase tracking-widest mb-2">Query Decomposition</h3>
                                        <h4 className="text-2xl font-serif text-white">{state.decomposition.main_question}</h4>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-slate-500 uppercase block">Complexity</span>
                                        <span className="text-3xl font-serif text-[var(--accent-gold)]">{state.decomposition.complexity_score}/10</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Sub-Issues</span>
                                        {state.decomposition.sub_questions.map((q, i) => (
                                            <div key={i} className="flex gap-3 text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                                                <ArrowRightIcon className="w-3 h-3 text-[var(--accent-gold)] shrink-0 mt-0.5" />
                                                {q}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-3">Required Domains</span>
                                            <div className="flex flex-wrap gap-2">
                                                {state.decomposition.required_domains.map(d => (
                                                    <span key={d} className="px-3 py-1 bg-[var(--accent-gold)]/10 rounded-full text-[10px] text-[var(--accent-gold)] border border-[var(--accent-gold)]/20 font-bold">{d}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Methodology</span>
                                            <p className="text-sm text-slate-300 font-medium">{state.decomposition.methodology_type}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Evidence Explorer */}
                        {state.literature.length > 0 && (
                            <div className="animate-slide-up-fade-in">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <BookOpenCheckIcon className="w-4 h-4" /> Evidence Explorer
                                </h3>
                                <EvidenceExplorer evidence={state.literature} />
                            </div>
                        )}

                        {/* 3. Madhhab Matrix */}
                        {state.madhhab_matrix && (
                            <div className="animate-slide-up-fade-in">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <ScaleIcon className="w-4 h-4" /> Madhhab Comparison Matrix
                                </h3>
                                <MadhhabMatrix matrix={state.madhhab_matrix} />
                            </div>
                        )}

                        {/* 4. Conflict Visualizer */}
                        {state.conflicts.length > 0 && (
                            <div className="animate-slide-up-fade-in">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2 text-red-400">
                                    <ShieldCheckIcon className="w-4 h-4" /> Conflict Detection Graph
                                </h3>
                                <ConflictVisualizer conflicts={state.conflicts} />
                            </div>
                        )}

                        {/* 5. Synthesis */}
                        {state.synthesis && (
                            <div className="animate-slide-up-fade-in">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <BrainCircuitIcon className="w-4 h-4" /> Jurisprudential Synthesis
                                </h3>
                                <SynthesisPanel synthesis={state.synthesis} />
                            </div>
                        )}

                        {/* 6. Final Draft */}
                        {state.draft && (
                            <div className="glass-panel p-10 rounded-3xl bg-white border border-slate-200 shadow-2xl text-slate-900 parchment-unfurl relative overflow-hidden animate-slide-up-fade-in">
                                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                    <IslamicStarIcon className="w-64 h-64" />
                                </div>
                                <div className="prose prose-slate max-w-none relative z-10">
                                    <Markdown remarkPlugins={[remarkGfm]}>{state.draft}</Markdown>
                                </div>
                                <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest">
                                    <span>Generated by Ijtihad AI Swarm</span>
                                    <span>{new Date().toLocaleDateString()}</span>
                                    <button 
                                        onClick={() => {
                                            setTopic('');
                                            setState({
                                                status: 'idle',
                                                currentAgent: '',
                                                logs: [],
                                                literature: [],
                                                evidence: [],
                                                conflicts: [],
                                                hypotheses: []
                                            });
                                            setStepStatuses({});
                                        }}
                                        className="text-[var(--accent-gold)] font-bold hover:underline"
                                    >
                                        New Research
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
