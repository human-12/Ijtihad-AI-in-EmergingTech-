
import React from 'react';
import type { QueryRefinement } from '../types';
import { 
    BrainCircuitIcon, AlertTriangleIcon, ClockIcon, GlobeIcon, 
    BookOpenIcon, ArrowRightIcon, IslamicStarIcon 
} from './icons';

interface QueryIntelligenceCardProps {
    refinement: QueryRefinement;
    onApply: (refined: string) => void;
    onDiscard: () => void;
    isLoading: boolean;
}

export const QueryIntelligenceCard: React.FC<QueryIntelligenceCardProps> = ({ 
    refinement, onApply, onDiscard, isLoading 
}) => {
    // Defensive defaults to prevent 'undefined' length errors
    const flags = refinement?.ambiguityFlags || [];
    const precedents = refinement?.historicalPrecedents || [];
    const context = refinement?.context || { madhhab: 'Unknown', region: 'General', urgency: 'Normal' };

    return (
        <div className="glass-panel p-8 rounded-3xl animate-slide-up-fade-in border-l-4 border-l-[var(--accent-gold)] relative overflow-hidden group">
            {/* Background Grain/Manuscript Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/parchment.png')] opacity-[0.03] pointer-events-none"></div>
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <BrainCircuitIcon className="w-64 h-64 text-[var(--accent-gold)]" />
            </div>

            <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 flex items-center justify-center shadow-lg">
                    <BrainCircuitIcon className="w-6 h-6 text-[var(--accent-gold)]" />
                </div>
                <div>
                    <h3 className="text-xl font-display font-bold text-white tracking-wide uppercase">Intelligence Report</h3>
                    <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">Jurisprudential Context Mapping</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10 relative z-10">
                {/* Formal Refinement */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Refined Jurisprudential Query</span>
                        <div className="bg-black/60 border border-white/5 p-6 rounded-2xl shadow-inner backdrop-blur-md">
                            <p className="text-lg text-[var(--text-primary)] font-medium leading-relaxed italic">
                                "{refinement?.refinedQuery}"
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="px-3 py-1.5 rounded-xl bg-[var(--accent-gold)]/5 border border-[var(--accent-gold)]/20 flex items-center gap-2">
                            <IslamicStarIcon className="w-3 h-3 text-[var(--accent-gold)]" />
                            <span className="text-[11px] font-bold text-slate-300">Madhhab: {context.madhhab}</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-[var(--accent-sage)]/5 border border-[var(--accent-sage)]/20 flex items-center gap-2">
                            <GlobeIcon className="w-3 h-3 text-[var(--accent-sage)]" />
                            <span className="text-[11px] font-bold text-slate-300">Region: {context.region}</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center gap-2">
                            <ClockIcon className="w-3 h-3 text-amber-500" />
                            <span className="text-[11px] font-bold text-slate-300">Urgency: {context.urgency}</span>
                        </div>
                    </div>
                </div>

                {/* Ambiguities & Historical */}
                <div className="space-y-6">
                    {flags.length > 0 && (
                        <div>
                            <span className="text-[9px] font-black text-red-400/70 uppercase tracking-widest mb-3 block flex items-center gap-2">
                                <AlertTriangleIcon className="w-3 h-3" /> Ambiguity Flags
                            </span>
                            <ul className="space-y-2">
                                {flags.map((flag, i) => (
                                    <li key={i} className="text-[11px] text-slate-400 bg-red-900/10 border border-red-500/20 p-3 rounded-xl">
                                        • {flag}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        <span className="text-[9px] font-black text-[var(--accent-sage)] uppercase tracking-widest mb-3 block flex items-center gap-2">
                            <BookOpenIcon className="w-3 h-3" /> Historical Analogies
                        </span>
                        <ul className="space-y-2">
                            {precedents.map((prec, i) => (
                                <li key={i} className="text-[11px] text-slate-500 italic bg-white/[0.02] border border-white/5 p-3 rounded-xl flex gap-3">
                                    <span className="text-[var(--accent-gold)] opacity-50 shrink-0">📜</span>
                                    {prec}
                                </li>
                            ))}
                            {precedents.length === 0 && (
                                <li className="text-[11px] text-slate-600 italic">No direct analogies found.</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 border-t border-white/5 pt-8 relative z-10">
                <button 
                    onClick={onDiscard}
                    className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition"
                >
                    Discard Refinement
                </button>
                <button 
                    onClick={() => onApply(refinement?.refinedQuery || "")}
                    disabled={!refinement?.refinedQuery}
                    className="flex-grow py-3 bg-[var(--accent-gold)] text-black font-black rounded-xl hover:brightness-110 transition shadow-lg shadow-[var(--accent-gold)]/20 flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50"
                >
                    Apply Refinement & Begin Research
                    <ArrowRightIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
