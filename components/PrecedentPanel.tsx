
import React, { useState, useEffect, useRef } from 'react';
import { runPrecedentPipeline } from '../services/geminiService';
import type { 
    PrecedentExplorerState, PrecedentMatch, ScenarioProfile, 
    ConflictReport, TrendSummary 
} from '../types';
import { 
    LibraryIcon, SearchIcon, LoaderIcon, FingerprintIcon, 
    BookOpenIcon, GlobeIcon, ScaleIcon, GitBranchIcon,
    ActivityIcon, CheckIcon, XIcon, ArrowRightIcon,
    ShieldCheckIcon, HistoryIcon, TrendingUpIcon,
    AlertTriangleIcon, InfoIcon
} from './icons';

interface PrecedentPanelProps {
    language: 'en' | 'ar' | 'ur';
}

const PRESETS = [
    "Digital asset staking in decentralized finance platforms",
    "Use of Zakat funds for infrastructure projects",
    "Copyright protection for AI-generated calligraphy",
    "Biometric data privacy rights in Islamic law"
];

const SimilarityBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-500">
        <span className="w-16 shrink-0">{label}</span>
        <div className="flex-grow h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full ${color}`} style={{ width: `${value}%` }}></div>
        </div>
        <span className="w-8 text-right">{value}%</span>
    </div>
);

export const PrecedentPanel: React.FC<PrecedentPanelProps> = ({ language }) => {
    const [scenario, setScenario] = useState('');
    const [state, setState] = useState<PrecedentExplorerState>({
        status: 'idle',
        step: 0,
        scenario: { topic: '', domain: '', legalAttributes: [], riskCategories: [], operativeElements: [] },
        matches: [],
        conflicts: { hasConflict: false, divergencePoints: [] },
        trends: { majorityView: '', minorityView: '', historicalShift: '', consensusLevel: 'Khilaf' },
        logs: []
    });
    
    const abortControllerRef = useRef<AbortController | null>(null);
    const logsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [state.logs]);

    const handleStart = async (inputScenario: string) => {
        if (!inputScenario.trim()) return;

        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        setState({
            status: 'profiling',
            step: 0,
            scenario: { topic: inputScenario, domain: '', legalAttributes: [], riskCategories: [], operativeElements: [] },
            matches: [],
            conflicts: { hasConflict: false, divergencePoints: [] },
            trends: { majorityView: '', minorityView: '', historicalShift: '', consensusLevel: 'Khilaf' },
            logs: [`[System] Initializing Precedent Explorer for: ${inputScenario}`]
        });

        try {
            const pipeline = runPrecedentPipeline(inputScenario, language, abortControllerRef.current.signal);

            for await (const update of pipeline) {
                if (update.type === 'log') {
                    setState(prev => ({ ...prev, logs: [...prev.logs, update.message] }));
                } else if (update.type === 'step') {
                    setState(prev => ({ ...prev, step: update.index }));
                } else if (update.type === 'profile') {
                    setState(prev => ({ ...prev, scenario: update.data }));
                } else if (update.type === 'matches') {
                    setState(prev => ({ ...prev, matches: update.data }));
                } else if (update.type === 'conflicts') {
                    setState(prev => ({ ...prev, conflicts: update.data }));
                } else if (update.type === 'trends') {
                    setState(prev => ({ ...prev, trends: update.data, status: 'complete' }));
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
        'Scenario Profiling',
        'Precedent Retrieval',
        'Conflict Analysis',
        'Trend Mapping'
    ];

    return (
        <div className="max-w-[1600px] mx-auto pb-20 animate-fade-in-down px-6">
            {/* Header */}
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-display font-bold text-slate-100 flex items-center gap-3">
                        <LibraryIcon className="w-8 h-8 text-indigo-400" />
                        Precedent <span className="text-indigo-400">Explorer</span>
                    </h2>
                    <p className="text-slate-400 mt-2 text-sm max-w-2xl">
                        Comparative case-law engine matching new scenarios against classical Nawazil and modern resolutions.
                    </p>
                </div>
                {state.status !== 'idle' && state.status !== 'complete' && (
                    <button 
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-500/30 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
                    >
                        <XIcon className="w-4 h-4" /> Interrupt Engine
                    </button>
                )}
            </header>

            {state.status === 'idle' && state.matches.length === 0 ? (
                <div className="glass-panel p-16 rounded-[2rem] max-w-4xl mx-auto text-center border-2 border-dashed border-slate-800 bg-black/20">
                    <FingerprintIcon className="w-24 h-24 text-indigo-400 mx-auto mb-8 opacity-80" />
                    <h3 className="text-3xl font-bold text-white mb-8 font-serif">Jurisprudential Matcher</h3>
                    <div className="relative max-w-2xl mx-auto">
                        <input 
                            type="text" 
                            value={scenario}
                            onChange={(e) => setScenario(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleStart(scenario)}
                            placeholder="Describe a legal scenario to find precedents..."
                            className="w-full bg-black/60 border border-slate-700 rounded-2xl p-6 pr-36 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-xl shadow-2xl"
                        />
                        <button 
                            onClick={() => handleStart(scenario)}
                            disabled={!scenario.trim()}
                            className="absolute right-3 top-3 bottom-3 px-8 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition shadow-lg flex items-center gap-2 uppercase tracking-widest text-xs"
                        >
                            Match <SearchIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-3 justify-center">
                        {PRESETS.map((p, i) => (
                            <button 
                                key={i} 
                                onClick={() => { setScenario(p); handleStart(p); }}
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
                                <ActivityIcon className="w-3 h-3" /> Matching Pipeline
                            </h3>
                            <div className="space-y-3">
                                {steps.map((s, i) => (
                                    <div key={i} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                                        state.step === i ? 'bg-indigo-500/10 border-indigo-500/30 scale-105 shadow-lg' : 
                                        state.step > i ? 'bg-indigo-900/10 border-indigo-500/20 opacity-80' : 
                                        'bg-white/5 border-transparent opacity-40'
                                    }`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                            state.step === i ? 'bg-indigo-500 text-white animate-pulse' : 
                                            state.step > i ? 'bg-indigo-400 text-black' : 'bg-slate-800 text-slate-500'
                                        }`}>
                                            {state.step > i ? <CheckIcon className="w-3 h-3" /> : i + 1}
                                        </div>
                                        <span className={`text-[11px] font-bold uppercase tracking-tight ${
                                            state.step === i ? 'text-indigo-400' : 'text-slate-400'
                                        }`}>
                                            {s}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-panel p-5 rounded-2xl flex-grow overflow-hidden flex flex-col bg-[#0a0a0a] border border-white/5 font-mono text-[10px]">
                            <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-3">System Logs</h3>
                            <div className="overflow-y-auto custom-scrollbar space-y-2 p-2 h-[400px]">
                                {state.logs.map((log, i) => (
                                    <div key={i} className="text-slate-400 leading-relaxed">
                                        <span className="text-indigo-500 mr-2">»</span>
                                        {log}
                                    </div>
                                ))}
                                <div ref={logsEndRef} />
                            </div>
                        </div>
                    </div>

                    {/* CENTER: Results Workspace */}
                    <div className="col-span-9 flex flex-col gap-8 pb-20">
                        
                        {/* 1. Scenario Profile */}
                        {state.scenario.domain && (
                            <div className="glass-panel p-6 rounded-2xl bg-white/5 border-l-4 border-l-indigo-500 animate-slide-up-fade-in">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Scenario Profile</h3>
                                        <h4 className="text-xl font-serif text-white">{state.scenario.topic}</h4>
                                    </div>
                                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-lg border border-indigo-500/30">
                                        {state.scenario.domain}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-3 bg-black/30 rounded-xl border border-white/5">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase block mb-2">Legal Attributes</span>
                                        <div className="flex flex-wrap gap-1">
                                            {state.scenario.legalAttributes.map((attr, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[9px] rounded-md">{attr}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-black/30 rounded-xl border border-white/5">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase block mb-2">Risk Categories</span>
                                        <div className="flex flex-wrap gap-1">
                                            {state.scenario.riskCategories.map((risk, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-red-900/20 text-red-400 text-[9px] rounded-md border border-red-500/10">{risk}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-black/30 rounded-xl border border-white/5">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase block mb-2">Operative Elements</span>
                                        <div className="flex flex-wrap gap-1">
                                            {state.scenario.operativeElements.map((elem, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-emerald-900/20 text-emerald-400 text-[9px] rounded-md border border-emerald-500/10">{elem}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Precedent Matrix */}
                        {state.matches.length > 0 && (
                            <div className="space-y-4 animate-slide-up-fade-in">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <FingerprintIcon className="w-4 h-4" /> Ranked Precedents
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {state.matches.map((match, i) => (
                                        <div key={match.id} className="glass-panel p-6 rounded-2xl bg-black/40 border border-white/5 hover:border-indigo-500/30 transition-all group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                        match.era === 'Classical' ? 'bg-amber-900/20 text-amber-500' : 'bg-cyan-900/20 text-cyan-400'
                                                    }`}>
                                                        {match.era === 'Classical' ? <BookOpenIcon className="w-5 h-5" /> : <GlobeIcon className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition">{match.title}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] text-slate-500 uppercase font-bold">{match.source}</span>
                                                            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                                            <span className="text-[10px] text-slate-500 uppercase font-bold">{match.madhhab}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-indigo-400">{match.similarity.total}%</div>
                                                    <span className="text-[9px] text-slate-500 uppercase font-bold">Match Score</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-12 gap-6">
                                                <div className="col-span-8 space-y-3">
                                                    <div className="p-3 bg-white/5 rounded-xl">
                                                        <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Ruling & Reasoning</span>
                                                        <p className="text-xs text-slate-200 font-medium mb-1">"{match.ruling}"</p>
                                                        <p className="text-[11px] text-slate-400 italic leading-relaxed">{match.reasoning}</p>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <div className="flex-1 p-2 bg-black/30 rounded-lg border border-white/5">
                                                            <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Operative Cause ('Illah)</span>
                                                            <span className="text-[10px] text-emerald-400">{match.operativeCause}</span>
                                                        </div>
                                                        {match.dissentingView && (
                                                            <div className="flex-1 p-2 bg-black/30 rounded-lg border border-white/5">
                                                                <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Dissenting View</span>
                                                                <span className="text-[10px] text-red-400">{match.dissentingView}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-span-4 space-y-2 p-3 bg-black/20 rounded-xl border border-white/5">
                                                    <span className="text-[9px] font-bold text-slate-500 uppercase block mb-2">Similarity Breakdown</span>
                                                    <SimilarityBar label="Surface" value={match.similarity.breakdown.surface} color="bg-slate-500" />
                                                    <SimilarityBar label="Structure" value={match.similarity.breakdown.structural} color="bg-indigo-500" />
                                                    <SimilarityBar label="Illah" value={match.similarity.breakdown.illah} color="bg-emerald-500" />
                                                    <SimilarityBar label="Maqasid" value={match.similarity.breakdown.maqasid} color="bg-amber-500" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3. Trends & Conflicts */}
                        {state.trends.majorityView && (
                            <div className="grid grid-cols-2 gap-6 animate-slide-up-fade-in">
                                <div className="glass-panel p-6 rounded-2xl bg-indigo-900/5 border border-indigo-500/20">
                                    <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <TrendingUpIcon className="w-3 h-3" /> Trend Analysis
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Majority View (Jumhur)</span>
                                            <p className="text-sm text-slate-200 leading-relaxed">{state.trends.majorityView}</p>
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Historical Shift</span>
                                            <p className="text-xs text-slate-400 italic">{state.trends.historicalShift}</p>
                                        </div>
                                        <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold">Consensus Level</span>
                                            <span className="px-2 py-0.5 bg-white/10 text-white text-[10px] font-bold rounded uppercase">{state.trends.consensusLevel}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-panel p-6 rounded-2xl bg-red-900/5 border border-red-500/10">
                                    <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <AlertTriangleIcon className="w-3 h-3" /> Conflict & Divergence
                                    </h3>
                                    {state.conflicts.hasConflict ? (
                                        <div className="space-y-3">
                                            {state.conflicts.divergencePoints.map((point, i) => (
                                                <div key={i} className="p-3 bg-black/40 rounded-xl border border-red-500/10">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-[10px] font-bold text-slate-300">{point.point}</span>
                                                        <span className={`text-[9px] font-bold uppercase ${
                                                            point.significance === 'High' ? 'text-red-500' : 'text-amber-500'
                                                        }`}>{point.significance} Impact</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 mt-2 text-[10px]">
                                                        <div className="p-1.5 bg-white/5 rounded text-slate-400">{point.viewA}</div>
                                                        <div className="p-1.5 bg-white/5 rounded text-slate-400">{point.viewB}</div>
                                                    </div>
                                                </div>
                                            ))}
                                            {state.conflicts.evolutionNote && (
                                                <p className="text-[10px] text-slate-500 italic mt-2 border-t border-white/5 pt-2">
                                                    Note: {state.conflicts.evolutionNote}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-40 opacity-50">
                                            <ShieldCheckIcon className="w-8 h-8 text-emerald-500 mb-2" />
                                            <span className="text-xs text-slate-400">No significant conflicts detected.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
