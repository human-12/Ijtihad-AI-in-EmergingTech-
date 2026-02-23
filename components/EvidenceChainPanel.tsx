
import React, { useState } from 'react';
import { generateProofChain } from '../services/citationService';
import type { ProofChain, EvidenceNode } from '../types';
import { 
    LoaderIcon, SearchIcon, QuranIcon, BookOpenIcon, 
    ScaleIcon, CheckIcon, ShieldCheckIcon, AlertTriangleIcon,
    GitBranchIcon, ArrowRightIcon
} from './icons';

const ConfidenceStars: React.FC<{ count: number }> = ({ count }) => {
    return (
        <div className="flex gap-0.5">
            {[...Array(3)].map((_, i) => (
                <CheckIcon key={i} className={`w-3 h-3 ${i < count ? 'text-[var(--accent-gold)]' : 'text-slate-700'}`} />
            ))}
        </div>
    );
};

const NodeCard: React.FC<{ node: EvidenceNode }> = ({ node }) => {
    return (
        <div className="relative group w-full">
            {/* The Node Card */}
            <div className={`glass-panel p-6 rounded-3xl border-l-4 transition-all hover:translate-x-1 ${
                node.sourceType === 'quran' ? 'border-l-[var(--accent-gold)] bg-[var(--accent-gold)]/5' :
                node.sourceType === 'hadith' ? 'border-l-[var(--accent-sage)] bg-[var(--accent-sage)]/5' :
                node.sourceType === 'ijma' ? 'border-l-purple-500 bg-purple-500/5' :
                'border-l-blue-500 bg-blue-500/5'
            }`}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                            {node.sourceType === 'quran' && <QuranIcon className="w-5 h-5 text-[var(--accent-gold)]" />}
                            {node.sourceType === 'hadith' && <BookOpenIcon className="w-5 h-5 text-[var(--accent-sage)]" />}
                            {node.sourceType === 'ijma' && <ShieldCheckIcon className="w-5 h-5 text-purple-400" />}
                            {node.sourceType === 'qiyas' && <GitBranchIcon className="w-5 h-5 text-blue-400" />}
                        </div>
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">{node.sourceType}</h4>
                            <h3 className="text-sm font-bold text-slate-100">{node.title}</h3>
                        </div>
                    </div>
                    <ConfidenceStars count={node.metadata.confidence} />
                </div>

                {node.arabicText && (
                    <div className="mb-4 p-4 bg-black/40 rounded-2xl border border-white/5">
                        <p className="text-xl text-center font-serif leading-loose text-white/90 quran-text" dir="rtl">
                            {node.arabicText}
                        </p>
                    </div>
                )}

                <p className="text-sm text-slate-300 leading-relaxed italic mb-4">
                    "{node.content}"
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    {node.metadata.reference && (
                        <div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Source Ref</span>
                            <span className="text-[11px] text-slate-300 font-mono">{node.metadata.reference}</span>
                        </div>
                    )}
                    {node.metadata.authenticity && (
                        <div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Grading (Takhrij)</span>
                            <span className={`text-[11px] font-bold ${node.metadata.authenticity.toLowerCase().includes('sahih') ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {node.metadata.authenticity}
                            </span>
                        </div>
                    )}
                </div>
                
                {node.metadata.narratorChain && (
                    <div className="mt-3 p-2 bg-black/20 rounded-lg border border-white/5">
                        <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Chain (Isnad)</span>
                        <p className="text-[10px] text-slate-400 truncate hover:whitespace-normal transition-all cursor-help">{node.metadata.narratorChain}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export const EvidenceChainPanel: React.FC<{ language: 'en' | 'ar' | 'ur' }> = ({ language }) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [proof, setProof] = useState<ProofChain | null>(null);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim() || isLoading) return;

        setIsLoading(true);
        setProof(null);

        try {
            const data = await generateProofChain(query);
            setProof(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fade-in-down">
            <header className="mb-10 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 flex items-center justify-center mx-auto mb-4">
                    <ScaleIcon className="w-8 h-8 text-[var(--accent-gold)]" />
                </div>
                <h2 className="text-3xl font-display font-bold text-slate-100 tracking-wider">Citation <span className="text-[var(--accent-gold)]">Engine</span></h2>
                <p className="text-slate-400 mt-2 max-w-2xl mx-auto text-sm leading-relaxed">
                    Trace the primary textual proof-chain for any ruling. Tracing the "Golden Thread" from Revelation to Result.
                </p>
            </header>

            <div className="glass-panel p-4 rounded-3xl mb-12 shadow-2xl">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for evidence chain (e.g. 'Evidence for prohibition of Riba', 'Basis of Hajj rites')..."
                        className="flex-grow bg-black/40 border border-slate-700/50 rounded-2xl p-4 text-slate-200 focus:ring-2 focus:ring-[var(--accent-gold)] outline-none"
                        disabled={isLoading}
                    />
                    <button 
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className="px-6 py-4 bg-[var(--accent-gold)] text-black font-black rounded-2xl hover:brightness-110 transition shadow-lg flex items-center gap-2 uppercase tracking-widest text-xs"
                    >
                        {isLoading ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
                        Trace Proof
                    </button>
                </form>
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <div className="w-1 bg-[var(--accent-gold)]/20 h-32 relative">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[var(--accent-gold)] to-transparent animate-[scan_2s_linear_infinite]"></div>
                    </div>
                    <p className="mt-8 text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Querying Classical Corpus...</p>
                </div>
            )}

            {proof && (
                <div className="animate-slide-up-fade-in relative">
                    {/* SVG Line Animation Layer */}
                    <div className="absolute top-0 left-[38px] bottom-0 w-1 pointer-events-none hidden md:block">
                        <svg className="h-full w-20 overflow-visible">
                            <line 
                                x1="2" y1="20" 
                                x2="2" y2="100%" 
                                stroke="url(#goldenGradient)" 
                                strokeWidth="3" 
                                strokeLinecap="round"
                                className="evidence-path"
                            />
                            <defs>
                                <linearGradient id="goldenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#E5C07B" stopOpacity="1" />
                                    <stop offset="50%" stopColor="#6366f1" stopOpacity="0.5" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <div className="space-y-12 mb-16">
                        {(proof.nodes || []).map((node, i) => (
                            <div key={i} className="flex gap-8 relative" style={{ animationDelay: `${i * 200}ms` }}>
                                {/* Chronological Marker */}
                                <div className="w-20 hidden md:flex flex-col items-center shrink-0 pt-2 z-10">
                                    <div className={`w-10 h-10 rounded-full bg-black border-2 border-slate-800 flex items-center justify-center shadow-xl transition-all duration-500 ${i === 0 ? 'scale-110 border-[var(--accent-gold)]' : ''}`}>
                                        <span className="text-[10px] font-black text-slate-500">0{i+1}</span>
                                    </div>
                                    <div className="mt-2 text-[8px] font-black text-slate-600 uppercase tracking-tighter text-center">
                                        Level {i+1}
                                    </div>
                                </div>
                                
                                <NodeCard node={node} />
                            </div>
                        ))}
                    </div>

                    {/* Final Verdict Card */}
                    <div className="glass-panel p-8 rounded-[40px] border-2 border-[var(--accent-gold)]/30 bg-gradient-to-br from-[var(--accent-gold)]/10 to-transparent shadow-[0_20px_50px_rgba(212,175,55,0.1)] relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-3xl bg-[var(--accent-gold)] flex items-center justify-center shadow-lg shadow-[var(--accent-gold)]/20 rotate-3">
                                    <ShieldCheckIcon className="w-8 h-8 text-black" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-display font-bold text-white tracking-wide uppercase">Final Scholarly Proof</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aggregate Confidence:</span>
                                        <div className="flex gap-1">
                                            {[...Array(proof.totalConfidence || 0)].map((_, i) => (
                                                <span key={i} className="text-[var(--accent-gold)] font-black text-xs">✓</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-black/40 px-6 py-3 rounded-2xl border border-white/5">
                                <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Hukm (Verdict)</span>
                                <span className="text-xl font-bold text-[var(--accent-gold)]">{proof.finalRuling}</span>
                            </div>
                        </div>

                        <div className="p-6 bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
                                <BookOpenIcon className="w-32 h-32" />
                            </div>
                            <h4 className="text-xs font-black text-[var(--accent-gold)] uppercase tracking-widest mb-4 flex items-center gap-2">
                                <AlertTriangleIcon className="w-4 h-4" /> Comprehensive Synthesis
                            </h4>
                            <p className="text-slate-200 text-sm leading-loose italic relative z-10">
                                "{proof.scholarlyNote}"
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
