
import React, { useState } from 'react';
import { ThumbsUpIcon, ThumbsDownIcon, CheckIcon, AlertTriangleIcon, TrendingUpIcon } from './icons';
import { logInteraction } from '../services/sheetsService';
import type { QAFeedback } from '../types';

interface FeedbackWidgetProps {
    query: string;
    response: string | object;
    category: string;
    onFeedbackSubmitted?: () => void;
}

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ query, response, category, onFeedbackSubmitted }) => {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted'>('idle');
    const [correction, setCorrection] = useState('');
    const [showCorrection, setShowCorrection] = useState(false);

    const handleSubmit = async (score: 1 | -1) => {
        if (score === -1 && !showCorrection) {
            setShowCorrection(true);
            return;
        }

        setStatus('submitting');
        const feedback: QAFeedback = {
            score,
            correction: score === -1 ? correction : undefined,
            category
        };

        await logInteraction(query, response, feedback, category);
        setStatus('submitted');
        if (onFeedbackSubmitted) onFeedbackSubmitted();
    };

    if (status === 'submitted') {
        return (
            <div className="flex items-center gap-2 text-xs text-[var(--accent-gold)] animate-fade-in-down mt-6 bg-[var(--accent-gold)]/10 px-4 py-2 rounded-lg border border-[var(--accent-gold)]/20 w-fit">
                <CheckIcon className="w-4 h-4" /> Feedback saved to Reinforced Memory.
            </div>
        );
    }

    return (
        <div className="mt-8 border-t border-white/5 pt-6 animate-fade-in-down">
            {!showCorrection ? (
                <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                        Help refine the {category} model?
                    </span>
                    <div className="flex gap-3">
                        <button onClick={() => handleSubmit(1)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-emerald-500/10 rounded-lg text-slate-400 hover:text-emerald-400 transition border border-transparent hover:border-emerald-500/20" title="Valid Output">
                            <ThumbsUpIcon className="w-4 h-4" /> <span className="text-xs font-bold">Valid</span>
                        </button>
                        <button onClick={() => handleSubmit(-1)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition border border-transparent hover:border-red-500/20" title="Report Issue">
                            <ThumbsDownIcon className="w-4 h-4" /> <span className="text-xs font-bold">Issues</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-red-900/10 border border-red-900/30 p-5 rounded-2xl">
                    <h4 className="text-xs font-bold text-red-300 uppercase mb-3 flex items-center gap-2">
                        <AlertTriangleIcon className="w-4 h-4" /> Expert Correction
                    </h4>
                    <p className="text-xs text-red-200/70 mb-3">
                        Provide the correct analysis or missing context to retrain the {category} agent.
                    </p>
                    <textarea 
                        value={correction}
                        onChange={(e) => setCorrection(e.target.value)}
                        placeholder="Describe the error or paste the correct ruling..."
                        className="w-full bg-black/40 border border-slate-700 rounded-xl p-4 text-xs text-slate-300 mb-4 focus:border-red-500 outline-none resize-none h-24 leading-relaxed"
                    />
                    <div className="flex gap-3 justify-end">
                        <button onClick={() => setShowCorrection(false)} className="text-xs text-slate-500 hover:text-white px-4 py-2">Cancel</button>
                        <button onClick={() => handleSubmit(-1)} className="text-xs bg-red-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-red-500 transition shadow-lg shadow-red-900/20 flex items-center gap-2">
                            <TrendingUpIcon className="w-4 h-4" /> Submit to Lab
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
