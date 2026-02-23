
import React, { useState } from 'react';
import type { ScholarlyConfidence } from '../types';
import { ScaleIcon, InfoIcon } from './icons';

interface ConfidenceMeterProps {
    confidence: ScholarlyConfidence;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({ confidence }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const getColorClass = (score: number) => {
        if (score >= 75) return 'text-emerald-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-orange-400';
    };

    const getBgClass = (score: number) => {
        if (score >= 75) return 'bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/10';
        if (score >= 50) return 'bg-yellow-500/10 border-yellow-500/30 shadow-yellow-500/10';
        return 'bg-orange-500/10 border-orange-500/30 shadow-orange-500/10';
    };

    const getStrokeColor = (score: number) => {
        if (score >= 75) return '#34d399'; // emerald-400
        if (score >= 50) return '#fbbf24'; // yellow-400
        return '#fb923c'; // orange-400
    };

    const getLabel = (level: string) => {
        switch (level) {
            case 'high': return 'High Consensus';
            case 'medium': return 'Moderate Ikhtilaf';
            case 'low': return 'Strong Disagreement';
            default: return 'Jurisprudential Weight';
        }
    };

    return (
        <div className="relative inline-block group">
            <div 
                className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-300 cursor-help hover:scale-105 shadow-xl ${getBgClass(confidence.score)}`}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                <div className="relative w-8 h-8 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 filter drop-shadow-[0_0_2px_rgba(0,0,0,0.5)]">
                        <circle
                            cx="16" cy="16" r="13"
                            fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3"
                        />
                        <circle
                            cx="16" cy="16" r="13"
                            fill="none" 
                            stroke={getStrokeColor(confidence.score)} 
                            strokeWidth="3"
                            strokeDasharray={`${(confidence.score / 100) * 81.6} 81.6`}
                            strokeLinecap="round"
                        />
                    </svg>
                    <ScaleIcon className={`w-3.5 h-3.5 absolute ${getColorClass(confidence.score)}`} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 leading-none mb-1">Scholarly Audit</span>
                    <span className={`text-xs font-bold ${getColorClass(confidence.score)} leading-tight`}>
                        {getLabel(confidence.level)} ({confidence.score}%)
                    </span>
                </div>
            </div>

            {showTooltip && (
                <div className="absolute top-full right-0 mt-3 w-80 glass-panel p-5 rounded-3xl z-50 shadow-2xl animate-fade-in-down border-white/10 ring-1 ring-white/5">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                            <InfoIcon className="w-4 h-4 text-[var(--accent-gold)]" /> Consensus Audit
                        </h4>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getBgClass(confidence.score)} ${getColorClass(confidence.score)}`}>
                            Verified
                        </span>
                    </div>
                    
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                <span>Scholarly Agreement</span>
                                <span className="text-slate-200 font-mono">{Math.round(confidence.factors.scholarlyAgreement * 100)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-[var(--accent-blue)] transition-all duration-1000" style={{ width: `${confidence.factors.scholarlyAgreement * 100}%` }}></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                <span>Evidence Strength (Dalil)</span>
                                <span className="text-slate-200 font-mono">{Math.round(confidence.factors.evidenceStrength * 100)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${confidence.factors.evidenceStrength * 100}%` }}></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                <span>Usul Consistency</span>
                                <span className="text-slate-200 font-mono">{Math.round(confidence.factors.usulConsistency * 100)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${confidence.factors.usulConsistency * 100}%` }}></div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 bg-white/[0.02] -mx-5 -mb-5 p-5 rounded-b-3xl">
                            <p className="text-xs text-slate-300 leading-relaxed italic">
                                &ldquo;{confidence.reasoning}&rdquo;
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
