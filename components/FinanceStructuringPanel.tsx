
import React, { useState } from 'react';
import { performFinanceStructuring } from '../services/geminiService';
import type { FinanceAnalysis } from '../types';
import { 
    CoinsIcon, BriefcaseIcon, FileCertificateIcon, TrendingUpIcon, 
    PieChartIcon, LoaderIcon, CheckIcon, AlertTriangleIcon, 
    ShieldAlertIcon, ScaleIcon, FileTextIcon, PrinterIcon
} from './icons';
import { FeedbackWidget } from './FeedbackWidget';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FinanceStructuringPanelProps {
    language: 'en' | 'ar' | 'ur';
}

const PRODUCT_TYPES = [
    "Sukuk (Islamic Bond)",
    "Murabaha (Cost-Plus Financing)",
    "Ijara (Leasing)",
    "Musharakah (Partnership)",
    "Mudarabah (Investment Partnership)",
    "Tawarruq (Commodity Murabaha)",
    "Crypto Token / DeFi Protocol",
    "Islamic Fintech App"
];

const PRESETS = [
    {
        label: "Crypto: Gold-Backed Token",
        type: "Crypto Token / DeFi Protocol",
        desc: "A digital token backed 1:1 by physical gold stored in a vault in Switzerland. Users pay a 1% transaction fee. The gold is audited monthly."
    },
    {
        label: "Fintech: Buy Now Pay Later",
        type: "Murabaha (Cost-Plus Financing)",
        desc: "A BNPL service where the app buys the item from the merchant and sells it to the user with a 0% interest rate, but charges a $10 late fee for missed payments."
    },
    {
        label: "Real Estate: Diminishing Musharakah",
        type: "Musharakah (Partnership)",
        desc: "Bank and client co-own a property. Client pays rent on the bank's share, and also buys small units of the bank's share monthly until full ownership."
    }
];

export const FinanceStructuringPanel: React.FC<FinanceStructuringPanelProps> = ({ language }) => {
    const [productType, setProductType] = useState(PRODUCT_TYPES[0]);
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<FinanceAnalysis | null>(null);
    const [showMemo, setShowMemo] = useState(false);

    const handleAnalyze = async () => {
        if (!description.trim() || isLoading) return;
        setIsLoading(true);
        setAnalysis(null);
        setShowMemo(false);
        try {
            const result = await performFinanceStructuring(productType, description, language);
            setAnalysis(result);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const getRiskColor = (severity: string) => {
        if (severity === 'High') return 'text-red-500 bg-red-500/10 border-red-500/20';
        if (severity === 'Medium') return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    };

    const ComplianceBadge: React.FC<{ status: string; score: number }> = ({ status, score }) => {
        const safeStatus = status || 'Unknown';
        let color = 'text-emerald-400 border-emerald-500';
        let bg = 'bg-emerald-900/20';
        if (safeStatus === 'Haram') { color = 'text-red-500 border-red-500'; bg = 'bg-red-900/20'; }
        if (safeStatus.includes('Shubha')) { color = 'text-amber-400 border-amber-500'; bg = 'bg-amber-900/20'; }

        return (
            <div className={`flex items-center gap-4 p-4 rounded-xl border ${color} ${bg} relative overflow-hidden`}>
                <div className="relative z-10 flex-grow">
                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-70 mb-1">Compliance Verdict</h3>
                    <div className="flex items-end gap-3">
                        <span className={`text-3xl font-black ${color.split(' ')[0]}`}>{safeStatus}</span>
                        <span className="text-xl font-bold text-slate-400 mb-1">{score}/100</span>
                    </div>
                </div>
                <div className="relative z-10">
                    {safeStatus === 'Halal' ? <FileCertificateIcon className="w-12 h-12 opacity-80" /> : <ShieldAlertIcon className="w-12 h-12 opacity-80" />}
                </div>
                {/* Background decorative glow */}
                <div className={`absolute -right-4 -top-4 w-32 h-32 rounded-full blur-[40px] opacity-20 ${safeStatus === 'Haram' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-fade-in-down">
            <header className="mb-10 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                    <BriefcaseIcon className="w-8 h-8 text-amber-400" />
                </div>
                <h2 className="text-3xl font-bold text-slate-100 uppercase tracking-tight">Islamic Finance <span className="text-amber-400">Engine</span></h2>
                <p className="text-slate-400 mt-2 max-w-2xl mx-auto text-sm leading-relaxed">
                    Advanced Shariah structuring for Banking, Fintech, and Crypto assets. Analyze Riba/Gharar risks and generate Board-ready memos.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-6 rounded-3xl">
                        <div className="flex items-center gap-2 mb-6">
                            <CoinsIcon className="w-5 h-5 text-slate-400" />
                            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Product Structure</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Product Category</label>
                                <div className="relative">
                                    <select 
                                        value={productType}
                                        onChange={(e) => setProductType(e.target.value)}
                                        className="w-full bg-black/40 border border-slate-700 rounded-xl p-3 text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none appearance-none text-sm"
                                    >
                                        {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Structure Details</label>
                                <textarea 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the cash flow, assets, and contractual relationships..."
                                    className="w-full bg-black/40 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none h-40 resize-none text-sm leading-relaxed"
                                />
                            </div>

                            <div className="pt-2">
                                <span className="text-[10px] font-bold text-slate-600 uppercase block mb-2">Quick Presets</span>
                                <div className="flex flex-col gap-2">
                                    {PRESETS.map((p, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => { setProductType(p.type); setDescription(p.desc); }}
                                            className="text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition group"
                                        >
                                            <span className="text-xs font-bold text-slate-300 group-hover:text-amber-400 block">{p.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleAnalyze}
                            disabled={isLoading || !description.trim()}
                            className="w-full mt-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-500 transition shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                        >
                            {isLoading ? <LoaderIcon className="w-4 h-4" /> : <TrendingUpIcon className="w-4 h-4" />}
                            Audit Structure
                        </button>
                    </div>
                </div>

                {/* Analysis Output */}
                <div className="lg:col-span-2 space-y-6">
                    {analysis ? (
                        <div className="animate-slide-up-fade-in space-y-6">
                            
                            {/* Top Stats */}
                            <ComplianceBadge status={analysis.complianceStatus} score={analysis.complianceScore} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Risk Breakdown */}
                                <div className="glass-panel p-6 rounded-3xl bg-red-950/5">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <AlertTriangleIcon className="w-4 h-4" /> Risk Analysis
                                    </h3>
                                    <div className="space-y-3">
                                        {(analysis.risks || []).map((risk, i) => (
                                            <div key={i} className={`p-3 rounded-lg border ${getRiskColor(risk.severity)}`}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-xs uppercase">{risk.type}</span>
                                                    <span className="text-[10px] px-1.5 rounded-full bg-black/20 font-bold">{risk.severity}</span>
                                                </div>
                                                <p className="text-xs opacity-90 leading-relaxed">{risk.description}</p>
                                                <p className="text-[10px] mt-1 opacity-60 italic">Loc: {risk.location}</p>
                                            </div>
                                        ))}
                                        {(analysis.risks || []).length === 0 && (
                                            <p className="text-sm text-slate-500 italic">No significant Shariah risks detected.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Structural Alternatives */}
                                <div className="glass-panel p-6 rounded-3xl bg-cyan-950/5">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <PieChartIcon className="w-4 h-4" /> Structural Engineering
                                    </h3>
                                    <div className="space-y-4">
                                        {(analysis.alternatives || []).map((alt, i) => (
                                            <div key={i} className="relative pl-4 border-l-2 border-cyan-500/30">
                                                <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-cyan-500"></div>
                                                <h4 className="text-xs font-bold text-slate-300 mb-1">
                                                    Replace <span className="text-red-400 line-through">{alt.originalComponent}</span> with <span className="text-cyan-400">{alt.proposedStructure}</span>
                                                </h4>
                                                <p className="text-xs text-slate-400 leading-relaxed mb-1">{alt.benefit}</p>
                                                <span className="text-[10px] text-cyan-600 font-mono uppercase bg-cyan-900/10 px-1 rounded">{alt.shariahMechanism}</span>
                                            </div>
                                        ))}
                                        {(analysis.alternatives || []).length === 0 && (
                                            <p className="text-sm text-slate-500 italic">Structure appears sound; no alternatives needed.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Board Memo & Standards */}
                            <div className="glass-panel p-6 rounded-3xl">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-2">
                                        <ScaleIcon className="w-5 h-5 text-amber-400" />
                                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">AAOIFI Standards & Memo</h3>
                                    </div>
                                    <button 
                                        onClick={() => setShowMemo(!showMemo)}
                                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition flex items-center gap-2"
                                    >
                                        {showMemo ? "Hide Memo" : "View Board Memo"} <FileTextIcon className="w-3 h-3" />
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {(analysis.aaoifiStandards || []).map((std, i) => (
                                        <span key={i} className="px-3 py-1 bg-slate-800 rounded-full text-[10px] text-slate-400 font-mono border border-white/5">
                                            {std}
                                        </span>
                                    ))}
                                </div>

                                {showMemo && (
                                    <div className="bg-white text-black p-8 rounded-xl font-serif text-sm leading-relaxed shadow-2xl relative animate-fade-in-down">
                                        <div className="absolute top-4 right-4 opacity-50">
                                            <PrinterIcon className="w-5 h-5 cursor-pointer hover:text-blue-600" onClick={() => window.print()} />
                                        </div>
                                        <div className="text-center border-b-2 border-black pb-4 mb-6">
                                            <h1 className="text-xl font-bold uppercase tracking-widest">Internal Shariah Memorandum</h1>
                                            <p className="text-xs mt-1 text-gray-600">Strictly Confidential • For Board Review Only</p>
                                        </div>
                                        <div className="prose prose-sm max-w-none">
                                            <Markdown remarkPlugins={[remarkGfm]}>{analysis.boardMemo}</Markdown>
                                        </div>
                                        <div className="mt-8 pt-4 border-t border-gray-300 flex justify-between items-end">
                                            <div className="text-xs text-gray-500">Generated by Ijtihad AI Engine<br/>{new Date().toLocaleDateString()}</div>
                                            <div className="h-10 border-b border-black w-40"></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <FeedbackWidget 
                                query={`Product: ${productType}. Details: ${description}`}
                                response={analysis}
                                category="Finance"
                            />

                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center glass-panel rounded-3xl border-2 border-dashed border-slate-700 bg-black/20 text-slate-600">
                            <BriefcaseIcon className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-50">Awaiting Product Structure</p>
                            <p className="text-xs text-center max-w-xs mt-2 opacity-40">Input details to generate Riba check, Gharar analysis, and Board Memos.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
