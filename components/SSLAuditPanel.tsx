
import React from 'react';
import type { SSLAuditResult } from '../types';
import { 
    ShieldCheckIcon, ShieldAlertIcon, CheckIcon, AlertTriangleIcon, 
    FileTextIcon, ScaleIcon 
} from './icons';

interface SSLAuditPanelProps {
    audit: SSLAuditResult;
}

export const SSLAuditPanel: React.FC<SSLAuditPanelProps> = ({ audit }) => {
    const isVerified = audit?.status === 'Verified';
    const isNeedsReview = audit?.status === 'Needs Review';
    
    const getStatusColor = () => {
        if (isVerified) return 'text-emerald-400 border-emerald-500/30 bg-emerald-900/10';
        if (isNeedsReview) return 'text-amber-400 border-amber-500/30 bg-amber-900/10';
        return 'text-red-400 border-red-500/30 bg-red-900/10';
    };

    const getIcon = () => {
        if (isVerified) return <ShieldCheckIcon className="w-12 h-12" />;
        if (isNeedsReview) return <AlertTriangleIcon className="w-12 h-12" />;
        return <ShieldAlertIcon className="w-12 h-12" />;
    };

    if (!audit) return null;

    return (
        <div className="mt-8 animate-fade-in-down">
            {/* Header / Status Banner */}
            <div className={`p-6 rounded-t-2xl border flex items-center justify-between ${getStatusColor()}`}>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-black/20 rounded-full">
                        {getIcon()}
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-widest leading-none mb-1">
                            SSL Verification: {audit.status || 'Pending'}
                        </h3>
                        <p className="text-xs opacity-80 font-mono uppercase tracking-wide">
                            Sharia Safety Layer Audit Complete
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="block text-3xl font-black">{Math.round(audit.confidenceScore || 0)}%</span>
                    <span className="text-[10px] uppercase font-bold opacity-70">Confidence Score</span>
                </div>
            </div>

            {/* Detailed Body */}
            <div className="bg-black/40 border-x border-b border-[var(--panel-border)] rounded-b-2xl p-6 space-y-6">
                
                {/* Flags Section */}
                {audit.flags && audit.flags.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <AlertTriangleIcon className="w-4 h-4" /> Audit Flags Detected
                        </h4>
                        <div className="grid gap-2">
                            {audit.flags.map((flag, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                    <span className="text-[10px] font-bold text-slate-500 mt-0.5">0{i+1}</span>
                                    <p className="text-sm text-slate-300">{flag}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reasoning Section */}
                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                        <ScaleIcon className="w-4 h-4" /> Audit Reasoning
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                        {audit.reasoning || "No detailed reasoning provided."}
                    </p>
                </div>

                {/* Corrected Version (Only if flagged/inaccurate) */}
                {audit.correctedVersion && (
                    <div className="border-t border-white/10 pt-6">
                        <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <CheckIcon className="w-24 h-24 text-emerald-500" />
                            </div>
                            <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-3 relative z-10">
                                <FileTextIcon className="w-4 h-4" /> Recommended Correction
                            </h4>
                            <p className="text-sm text-emerald-100/90 leading-relaxed italic relative z-10">
                                "{audit.correctedVersion}"
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
