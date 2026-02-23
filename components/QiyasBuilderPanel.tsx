
import React, { useState, useEffect, useRef } from 'react';
import { runQiyasPipeline } from '../services/geminiService';
import type { 
    QiyasWorkbenchState, QiyasAsl, QiyasIllah, 
    IllahValidationCriteria, QiyasFar, QiyasConflict 
} from '../types';
import { 
    GitMergeIcon, LoaderIcon, ArrowRightIcon, ScaleIcon, 
    BookOpenIcon, GavelIcon, AlertTriangleIcon, CheckIcon,
    ShieldCheckIcon, BrainCircuitIcon, NetworkIcon, 
    ChevronRightIcon, XIcon, InfoIcon, EditIcon,
    HistoryIcon, ActivityIcon, FileTextIcon
} from './icons';
import { FeedbackWidget } from './FeedbackWidget';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface QiyasBuilderPanelProps {
    language: 'en' | 'ar' | 'ur';
}

const PRESETS = [
    "Is cryptocurrency trading analogous to classical Sarf (currency exchange)?",
    "Ruling on lab-grown meat via analogy to classical slaughter rules",
    "Are NFTs analogous to classical property (Mal)?",
    "Applying rules of travel to modern space flight"
];

const ValidationRow: React.FC<{ label: string; criteria: { status: 'Pass' | 'Fail'; reasoning: string } }> = ({ label, criteria }) => (
    <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
        <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${criteria.status === 'Pass' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
            {criteria.status === 'Pass' ? <CheckIcon className="w-3 h-3" /> : <XIcon className="w-3 h-3" />}
        </div>
        <div>
            <h5 className="text-xs font-bold text-slate-200 uppercase tracking-tight">{label}</h5>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{criteria.reasoning}</p>
        </div>
    </div>
);

export const QiyasBuilderPanel: React.FC<QiyasBuilderPanelProps> = ({ language }) => {
    const [topic, setTopic] = useState('');
    const [state, setState] = useState<QiyasWorkbenchState>({
        status: 'idle',
        step: 0,
        far: { topic: '', attributes: [], similarityScore: 0 },
        aslCandidates: [],
        conflicts: [],
        confidenceScore: 0,
        reasoningChain: [],
        logs: []
    });
    const abortControllerRef = useRef<AbortController | null>(null);
    const logsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [state.logs]);

    const handleStart = async (inputTopic: string) => {
        if (!inputTopic.trim()) return;

        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        setState({
            status: 'processing',
            step: 0,
            far: { topic: inputTopic, attributes: [], similarityScore: 0 },
            aslCandidates: [],
            conflicts: [],
            confidenceScore: 0,
            reasoningChain: [],
            logs: [`[System] Initializing Qiyas Workbench for: ${inputTopic}`]
        });

        try {
            const pipeline = runQiyasPipeline(inputTopic, language, abortControllerRef.current.signal);

            for await (const update of pipeline) {
                if (update.type === 'log') {
                    setState(prev => ({ ...prev, logs: [...prev.logs, update.message] }));
                } else if (update.type === 'step') {
                    setState(prev => ({ ...prev, step: update.index }));
                } else if (update.type === 'far_analysis') {
                    setState(prev => ({ ...prev, far: update.data }));
                } else if (update.type === 'asl_candidates') {
                    setState(prev => ({ ...prev, aslCandidates: update.data }));
                } else if (update.type === 'illah_extraction') {
                    setState(prev => ({ ...prev, illah: update.data }));
                } else if (update.type === 'validation_report') {
                    setState(prev => ({ ...prev, validation: update.data }));
                } else if (update.type === 'conflict_detection') {
                    setState(prev => ({ ...prev, conflicts: update.data }));
                } else if (update.type === 'synthesis') {
                    setState(prev => ({ 
                        ...prev, 
                        finalRuling: update.data.ruling, 
                        confidenceScore: update.data.confidence,
                        reasoningChain: update.data.chain,
                        status: 'complete'
                    }));
                }
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                setState(prev => ({ ...prev, status: 'idle', logs: [...prev.logs, `[Error] ${err.message}`] }));
            }
        }
    };

    const handleCancel = () => {
        abortControllerRef.current?.abort();
        setState(prev => ({ ...prev, status: 'idle', logs: [...prev.logs, '[System] Process interrupted by user.'] }));
    };

    const steps = [
        'Far\' Attribute Mapping',
        'Asl Retrieval',
        '\'Illah Extraction',
        '\'Illah Validity Testing',
        'Conflict Detection',
        'Analogical Synthesis'
    ];

    return (
        <div className="max-w-[1600px] mx-auto pb-20 animate-fade-in-down px-6">
            {/* Header */}
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-display font-bold text-slate-100 flex items-center gap-3">
                        <GitMergeIcon className="w-8 h-8 text-[var(--accent-sage)]" />
                        Qiyas <span className="text-[var(--accent-sage)]">Workbench</span>
                    </h2>
                    <p className="text-slate-400 mt-2 text-sm max-w-2xl">
                        Formal analogical reasoning engine for Usul al-Fiqh. 
                        Structured construction and validation of jurisprudential analogies.
                    </p>
                </div>
                {state.status === 'processing' && (
                    <button 
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-500/30 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
                    >
                        <XIcon className="w-4 h-4" /> Interrupt Engine
                    </button>
                )}
            </header>

            {state.status === 'idle' && !state.finalRuling ? (
                <div className="glass-panel p-16 rounded-[2rem] max-w-4xl mx-auto text-center border-2 border-dashed border-slate-800 bg-black/20">
                    <BrainCircuitIcon className="w-24 h-24 text-[var(--accent-sage)] mx-auto mb-8 opacity-80" />
                    <h3 className="text-3xl font-bold text-white mb-8 font-serif">Formal Analogical Constructor</h3>
                    <div className="relative max-w-2xl mx-auto">
                        <input 
                            type="text" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleStart(topic)}
                            placeholder="Enter modern issue (Far') for analogical analysis..."
                            className="w-full bg-black/60 border border-slate-700 rounded-2xl p-6 pr-36 text-slate-200 focus:ring-2 focus:ring-[var(--accent-sage)] outline-none text-xl shadow-2xl"
                        />
                        <button 
                            onClick={() => handleStart(topic)}
                            disabled={!topic.trim()}
                            className="absolute right-3 top-3 bottom-3 px-8 bg-[var(--accent-sage)] hover:bg-emerald-600 text-white font-bold rounded-xl transition shadow-lg flex items-center gap-2 uppercase tracking-widest text-xs"
                        >
                            Launch <ArrowRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-3 justify-center">
                        {PRESETS.map((p, i) => (
                            <button 
                                key={i} 
                                onClick={() => { setTopic(p); handleStart(p); }}
                                className="text-[11px] bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full text-slate-400 hover:text-white transition border border-white/5 font-medium"
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-12 gap-8">
                    
                    {/* LEFT RAIL: Pipeline & Logs */}
                    <div className="col-span-3 flex flex-col gap-6">
                        <div className="glass-panel p-6 rounded-2xl bg-black/40 border border-white/5">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <ActivityIcon className="w-3 h-3" /> Reasoning Pipeline
                            </h3>
                            <div className="space-y-3">
                                {steps.map((s, i) => (
                                    <div key={i} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                                        state.step === i ? 'bg-[var(--accent-sage)]/10 border-[var(--accent-sage)]/30 scale-105 shadow-lg' : 
                                        state.step > i ? 'bg-emerald-900/10 border-emerald-500/20 opacity-80' : 
                                        'bg-white/5 border-transparent opacity-40'
                                    }`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                            state.step === i ? 'bg-[var(--accent-sage)] text-white animate-pulse' : 
                                            state.step > i ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-500'
                                        }`}>
                                            {state.step > i ? <CheckIcon className="w-3 h-3" /> : i + 1}
                                        </div>
                                        <span className={`text-[11px] font-bold uppercase tracking-tight ${
                                            state.step === i ? 'text-[var(--accent-sage)]' : 'text-slate-400'
                                        }`}>
                                            {s}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-panel p-5 rounded-2xl flex-grow overflow-hidden flex flex-col bg-[#0a0a0a] border border-white/5 font-mono text-[10px]">
                            <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-3">Logic Execution Terminal</h3>
                            <div className="overflow-y-auto custom-scrollbar space-y-2 p-2 h-[400px]">
                                {state.logs.map((log, i) => (
                                    <div key={i} className="text-slate-400 leading-relaxed">
                                        <span className="text-[var(--accent-sage)] mr-2">»</span>
                                        {log}
                                    </div>
                                ))}
                                <div ref={logsEndRef} />
                            </div>
                        </div>
                    </div>

                    {/* CENTER: Workbench Workspace */}
                    <div className="col-span-9 flex flex-col gap-8 pb-20">
                        
                        {/* 1. Far' Attribute Mapping */}
                        <div className="grid grid-cols-2 gap-8">
                            <div className="glass-panel p-8 rounded-2xl bg-white/5 border-l-4 border-l-[var(--accent-sage)]">
                                <h3 className="text-[10px] font-bold text-[var(--accent-sage)] uppercase tracking-widest mb-4">The Modern Issue (Far')</h3>
                                <h4 className="text-2xl font-serif text-white mb-6">{state.far.topic}</h4>
                                <div className="space-y-3">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Extracted Attributes</span>
                                    {state.far.attributes.map((attr, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 bg-black/30 rounded-xl border border-white/5">
                                            <div>
                                                <span className="text-[10px] text-slate-500 uppercase block">{attr.name}</span>
                                                <span className="text-xs text-slate-200 font-medium">{attr.value}</span>
                                            </div>
                                            {attr.matchWithAsl && (
                                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold rounded-full border border-emerald-500/20">Relevant</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-panel p-8 rounded-2xl bg-black/40 border border-white/5">
                                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Candidate Roots (Asl)</h3>
                                <div className="space-y-4">
                                    {state.aslCandidates.map((asl, i) => (
                                        <div key={asl.id} className={`p-4 rounded-xl border transition-all ${i === 0 ? 'bg-[var(--accent-gold)]/5 border-[var(--accent-gold)]/20' : 'bg-white/5 border-white/5'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h5 className="text-sm font-bold text-white">{asl.caseName}</h5>
                                                <span className="text-[9px] font-bold text-[var(--accent-gold)] uppercase tracking-widest">{asl.sourceStrength}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-400 italic mb-3">"{asl.context}"</p>
                                            <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                                                <GavelIcon className="w-3 h-3 text-[var(--accent-gold)]" />
                                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">Hukm: {asl.hukm}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {state.aslCandidates.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-12 opacity-20">
                                            <BookOpenIcon className="w-12 h-12 mb-4" />
                                            <span className="text-xs uppercase font-bold">Retrieving Precedents...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2. 'Illah Analysis & Validation */}
                        {state.illah && (
                            <div className="grid grid-cols-12 gap-8 animate-slide-up-fade-in">
                                <div className="col-span-5 glass-panel p-8 rounded-2xl bg-[var(--accent-sage)]/5 border border-[var(--accent-sage)]/20">
                                    <div className="flex justify-between items-start mb-6">
                                        <h3 className="text-[10px] font-bold text-[var(--accent-sage)] uppercase tracking-widest">Effective Cause ('Illah)</h3>
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${state.illah.type === 'Mansusah' ? 'bg-emerald-500 text-black' : 'bg-blue-500 text-white'}`}>
                                            {state.illah.type}
                                        </span>
                                    </div>
                                    <h4 className="text-xl font-serif text-white mb-4">{state.illah.description}</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Justification</span>
                                            <p className="text-xs text-slate-300 leading-relaxed">{state.illah.justification}</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Scope</span>
                                            <p className="text-xs text-slate-400 italic">{state.illah.scope}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-7 glass-panel p-8 rounded-2xl bg-black/40 border border-white/5">
                                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Validity Testing Framework</h3>
                                    {state.validation ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <ValidationRow label="Munasib (Suitable)" criteria={state.validation.munasib} />
                                            <ValidationRow label="Zahir (Apparent)" criteria={state.validation.zahir} />
                                            <ValidationRow label="Mundabit (Precise)" criteria={state.validation.mundabit} />
                                            <ValidationRow label="Mut'addi (Transferable)" criteria={state.validation.mutaddi} />
                                            <div className="col-span-2">
                                                <ValidationRow label="No Textual Override" criteria={state.validation.noOverride} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 opacity-20">
                                            <ShieldCheckIcon className="w-12 h-12 mb-4" />
                                            <span className="text-xs uppercase font-bold">Running Validity Tests...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 3. Conflicts & Synthesis */}
                        {state.finalRuling && (
                            <div className="grid grid-cols-12 gap-8 animate-slide-up-fade-in">
                                <div className="col-span-4 flex flex-col gap-6">
                                    <div className="glass-panel p-6 rounded-2xl bg-red-900/5 border border-red-500/10">
                                        <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <AlertTriangleIcon className="w-3 h-3" /> Conflict Detection
                                        </h3>
                                        <div className="space-y-3">
                                            {state.conflicts.map((c, i) => (
                                                <div key={i} className="p-3 bg-black/40 rounded-xl border border-red-500/10">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-[9px] font-bold text-red-500 uppercase">{c.type}</span>
                                                        <span className="text-[9px] font-bold text-slate-500 uppercase">{c.severity} Impact</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-300 leading-relaxed">{c.description}</p>
                                                </div>
                                            ))}
                                            {state.conflicts.length === 0 && (
                                                <p className="text-xs text-slate-500 italic text-center py-4">No textual overrides detected.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="glass-panel p-6 rounded-2xl bg-[var(--accent-gold)]/5 border border-[var(--accent-gold)]/20">
                                        <h3 className="text-[10px] font-bold text-[var(--accent-gold)] uppercase tracking-widest mb-4">Confidence Meter</h3>
                                        <div className="flex items-end gap-3 mb-4">
                                            <span className="text-4xl font-serif text-[var(--accent-gold)]">{state.confidenceScore}%</span>
                                            <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Weighted Score</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-[var(--accent-gold)] transition-all duration-1000" style={{ width: `${state.confidenceScore}%` }}></div>
                                        </div>
                                        <div className="mt-4 grid grid-cols-2 gap-2 text-[9px] text-slate-500 uppercase font-bold">
                                            <div className="flex justify-between"><span>'Illah Strength</span><span>40%</span></div>
                                            <div className="flex justify-between"><span>Authority</span><span>25%</span></div>
                                            <div className="flex justify-between"><span>Similarity</span><span>15%</span></div>
                                            <div className="flex justify-between"><span>Consensus</span><span>10%</span></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-8 glass-panel p-10 rounded-3xl bg-white border border-slate-200 shadow-2xl text-slate-900 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                        <ScaleIcon className="w-64 h-64" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                                            <h3 className="text-2xl font-serif font-bold text-slate-800 flex items-center gap-3">
                                                <GavelIcon className="w-7 h-7 text-[var(--accent-sage)]" />
                                                Analogical Ruling Output
                                            </h3>
                                            <div className="flex gap-2">
                                                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition" title="Edit Ruling"><EditIcon className="w-4 h-4" /></button>
                                                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition" title="View History"><HistoryIcon className="w-4 h-4" /></button>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                                            <p className="text-lg font-medium leading-relaxed text-slate-800 italic">
                                                "{state.finalRuling}"
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <NetworkIcon className="w-4 h-4" /> Reasoning Chain
                                            </h4>
                                            <div className="space-y-4">
                                                {state.reasoningChain.map((step, i) => (
                                                    <div key={i} className="flex gap-4 group">
                                                        <div className="flex flex-col items-center shrink-0">
                                                            <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 group-hover:bg-[var(--accent-sage)] group-hover:text-white transition-colors">
                                                                {i + 1}
                                                            </div>
                                                            {i < state.reasoningChain.length - 1 && <div className="w-px h-full bg-slate-100 mt-2"></div>}
                                                        </div>
                                                        <p className="text-sm text-slate-600 pt-0.5 leading-relaxed">{step}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <button 
                                                    onClick={() => setState(prev => ({ ...prev, status: 'idle', finalRuling: undefined }))}
                                                    className="px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-black transition uppercase tracking-widest"
                                                >
                                                    New Analysis
                                                </button>
                                                <button className="px-6 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition uppercase tracking-widest flex items-center gap-2">
                                                    <FileTextIcon className="w-3 h-3" /> Export PDF
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
                                                Scholarly Audit Passed
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
