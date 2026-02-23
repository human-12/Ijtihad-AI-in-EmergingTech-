
import React, { useState } from 'react';
import { performDualComplianceAnalysis } from '../services/geminiService';
import type { ComplianceAnalysis, DecisionStep } from '../types';
import { 
    BalanceScaleIcon, GavelIcon, IslamicStarIcon, AlertTriangleIcon, 
    CheckIcon, ShieldAlertIcon, LoaderIcon, GlobeIcon,
    FlowchartIcon, PrinterIcon, DownloadIcon, FileTextIcon
} from './icons';
import { FeedbackWidget } from './FeedbackWidget';

interface DualCompliancePanelProps {
    language: 'en' | 'ar' | 'ur';
}

const JURISDICTIONS = [
    "United Kingdom", "United States", "Canada", "Australia", 
    "Pakistan", "India", "UAE", "Saudi Arabia", "Malaysia", "Singapore"
];

const PRESETS = [
    { label: "Inheritance (UK vs Islamic)", text: "I want to distribute my estate according to Islamic Fiqh, giving my son double the share of my daughter. However, I live in the UK and own property jointly with my wife." },
    { label: "Mortgages (USA)", text: "I need to buy a house in Chicago for my family. Conventional mortgages involve interest (riba). Are there compliant ways that are also legally recognized?" },
    { label: "Divorce Custody (UAE)", text: "My husband pronounced Talaq three times. We have a 5-year-old son. Who gets custody under Sharia vs UAE Personal Status Law?" }
];

const DecisionTreeWidget: React.FC<{ steps: DecisionStep[] }> = ({ steps }) => {
    return (
        <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-slate-700/50">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                <FlowchartIcon className="w-5 h-5 text-indigo-400" />
                Logic Flow Visualization
            </h3>
            <div className="space-y-0 relative">
                {(steps || []).map((step, i) => (
                    <div key={i} className="flex gap-4 relative group">
                        {/* Connecting Line */}
                        {i !== steps.length - 1 && (
                            <div className="absolute left-[15px] top-8 bottom-[-20px] w-0.5 bg-slate-800 group-hover:bg-slate-700 transition-colors"></div>
                        )}
                        
                        {/* Node Icon */}
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg shrink-0 ${
                            step.type === 'shariah' ? 'bg-emerald-900/50 border-emerald-500/50 text-emerald-400' :
                            step.type === 'civil' ? 'bg-blue-900/50 border-blue-500/50 text-blue-400' :
                            'bg-indigo-900/50 border-indigo-500/50 text-indigo-400'
                        }`}>
                            <span className="text-xs font-bold">{i + 1}</span>
                        </div>

                        {/* Content */}
                        <div className="pb-8">
                            <div className={`p-4 rounded-xl border ${
                                step.type === 'shariah' ? 'bg-emerald-900/10 border-emerald-500/20' :
                                step.type === 'civil' ? 'bg-blue-900/10 border-blue-500/20' :
                                'bg-indigo-900/10 border-indigo-500/20'
                            }`}>
                                <h4 className="text-xs font-black uppercase mb-1 opacity-70 tracking-wider">
                                    {step.type === 'synthesis' ? 'Synthesis / Resolution' : `${step.type} Analysis`}
                                </h4>
                                <p className="text-sm font-bold text-slate-200 mb-1">{step.step}</p>
                                <p className="text-xs text-slate-400 italic">Outcome: {step.outcome}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const DualCompliancePanel: React.FC<DualCompliancePanelProps> = ({ language }) => {
    const [scenario, setScenario] = useState('');
    const [jurisdiction, setJurisdiction] = useState(JURISDICTIONS[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<ComplianceAnalysis | null>(null);

    const handleAnalyze = async () => {
        if (!scenario.trim() || isLoading) return;
        setIsLoading(true);
        setAnalysis(null);
        try {
            const result = await performDualComplianceAnalysis(scenario, jurisdiction, language);
            setAnalysis(result);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const generateCourtAnnexure = () => {
        if (!analysis) return;
        
        const content = `
            <html>
            <head>
                <title>Legal-Shariah Compliance Annexure</title>
                <style>
                    body { font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #000; }
                    h1 { text-align: center; text-transform: uppercase; font-size: 18pt; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 30px; }
                    h2 { font-size: 14pt; margin-top: 25px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                    .header-meta { margin-bottom: 40px; font-size: 11pt; }
                    .section { margin-bottom: 20px; }
                    .conflict-box { background: #f9f9f9; border: 1px solid #ddd; padding: 15px; margin: 15px 0; }
                    .footer { margin-top: 50px; font-size: 9pt; text-align: center; color: #555; border-top: 1px solid #eee; padding-top: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10pt; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <h1>Annexure A: Dual Compliance Analysis</h1>
                
                <div class="header-meta">
                    <strong>Jurisdiction:</strong> ${jurisdiction}<br/>
                    <strong>Date:</strong> ${new Date().toLocaleDateString()}<br/>
                    <strong>Reference ID:</strong> ${Math.random().toString(36).substring(7).toUpperCase()}
                </div>

                <div class="section">
                    <h2>1. Scenario Overview</h2>
                    <p>${scenario}</p>
                </div>

                <div class="section">
                    <h2>2. Independent Rulings</h2>
                    <table>
                        <tr>
                            <th width="50%">Shariah (Fiqh) Assessment</th>
                            <th width="50%">Civil Law Assessment</th>
                        </tr>
                        <tr>
                            <td valign="top">
                                <strong>Verdict:</strong> ${analysis.shariahRuling.verdict}<br/><br/>
                                <em>Evidence:</em> ${analysis.shariahRuling.evidence}
                            </td>
                            <td valign="top">
                                <strong>Verdict:</strong> ${analysis.civilRuling.verdict}<br/><br/>
                                <em>Statutes:</em> ${analysis.civilRuling.relevantLaws}
                            </td>
                        </tr>
                    </table>
                </div>

                <div class="section">
                    <h2>3. Conflict Identification</h2>
                    ${(analysis.conflicts || []).length > 0 ? (analysis.conflicts || []).map(c => `
                        <div class="conflict-box">
                            <strong>Point of Friction:</strong> ${c.point}<br/>
                            <strong>Severity:</strong> ${c.severity.toUpperCase()}<br/>
                            ${c.description}
                        </div>
                    `).join('') : '<p>No direct legal conflicts identified.</p>'}
                </div>

                <div class="section">
                    <h2>4. Resolution Strategy & Safe Harbor</h2>
                    <p>${analysis.resolutionStrategy}</p>
                    <ul>
                        ${(analysis.safeOptions || []).map(opt => `<li>${opt}</li>`).join('')}
                    </ul>
                </div>

                <div class="footer">
                    DISCLAIMER: This document is generated by an AI Legal Assistant for informational purposes only. 
                    It does not constitute binding legal advice or a formal Fatwa unless ratified by a qualified human expert.
                </div>
                <script>window.print();</script>
            </body>
            </html>
        `;

        const win = window.open('', '_blank');
        if (win) {
            win.document.write(content);
            win.document.close();
        }
    };

    const downloadFlowchart = () => {
        if (!analysis?.decisionTree) return;
        
        const mermaid = `graph TD\n${(analysis.decisionTree || []).map((step, i) => {
            const next = i < analysis.decisionTree.length - 1 ? ` --> Step${i+2}` : '';
            return `    Step${i+1}["${step.step}<br/>Outcome: ${step.outcome}"]${next}`;
        }).join('\n')}`;
        
        const blob = new Blob([mermaid], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `decision_tree_${Date.now()}.mmd`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-fade-in-down">
            <header className="mb-10 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <BalanceScaleIcon className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-3xl font-bold text-slate-100 uppercase tracking-tight">Dual Compliance <span className="text-emerald-400">Engine</span></h2>
                <p className="text-slate-400 mt-2 max-w-2xl mx-auto text-sm leading-relaxed">
                    Evaluate scenarios simultaneously under Islamic Law (Fiqh) and your local Civil Jurisdiction. Identify legal conflicts and find safe paths forward.
                </p>
                <p className="text-[10px] text-red-400 mt-3 font-bold bg-red-900/10 inline-block px-3 py-1 rounded border border-red-900/20">
                    DISCLAIMER: INFORMATIONAL USE ONLY. NOT LEGAL ADVICE.
                </p>
            </header>

            <div className="glass-panel p-6 rounded-3xl mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase">Scenario Description</label>
                        <textarea 
                            value={scenario}
                            onChange={(e) => setScenario(e.target.value)}
                            placeholder="Describe your legal/religious dilemma..."
                            className="w-full h-32 bg-black/40 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase">Civil Jurisdiction</label>
                        <div className="relative">
                            <select 
                                value={jurisdiction}
                                onChange={(e) => setJurisdiction(e.target.value)}
                                className="w-full bg-black/40 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                            >
                                {JURISDICTIONS.map(j => <option key={j} value={j}>{j}</option>)}
                            </select>
                            <GlobeIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                        </div>
                        <div className="pt-2">
                            <span className="text-[10px] font-bold text-slate-600 uppercase block mb-2">Quick Presets</span>
                            <div className="flex flex-col gap-2">
                                {PRESETS.map((p, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => { setScenario(p.text); if(p.label.includes("UK")) setJurisdiction("United Kingdom"); if(p.label.includes("USA")) setJurisdiction("United States"); if(p.label.includes("UAE")) setJurisdiction("UAE"); }}
                                        className="text-left text-xs bg-white/5 hover:bg-white/10 p-2 rounded text-slate-400 hover:text-white transition"
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={handleAnalyze}
                        disabled={isLoading || !scenario.trim()}
                        className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition shadow-lg flex items-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? <LoaderIcon className="w-5 h-5" /> : <BalanceScaleIcon className="w-5 h-5" />}
                        Run Dual Analysis
                    </button>
                </div>
            </div>

            {analysis && (
                <div className="animate-slide-up-fade-in space-y-8">
                    {/* The Dual View */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 relative">
                        {/* Shariah Side */}
                        <div className="glass-panel p-6 rounded-t-3xl md:rounded-tr-none md:rounded-l-3xl border-r-0 border-emerald-500/30 bg-emerald-950/10">
                            <div className="flex items-center gap-3 mb-4">
                                <IslamicStarIcon className="w-6 h-6 text-emerald-400" />
                                <h3 className="text-lg font-bold text-emerald-100">Islamic Law (Fiqh)</h3>
                            </div>
                            <p className="text-sm font-bold text-emerald-200 mb-2">{analysis.shariahRuling.verdict}</p>
                            <p className="text-xs text-emerald-300/70 leading-relaxed italic">{analysis.shariahRuling.evidence}</p>
                        </div>

                        {/* Civil Side */}
                        <div className="glass-panel p-6 rounded-b-3xl md:rounded-bl-none md:rounded-r-3xl border-l-0 border-blue-500/30 bg-blue-950/10">
                            <div className="flex items-center gap-3 mb-4 justify-end">
                                <h3 className="text-lg font-bold text-blue-100">{jurisdiction} Civil Law</h3>
                                <GavelIcon className="w-6 h-6 text-blue-400" />
                            </div>
                            <p className="text-sm font-bold text-blue-200 mb-2 text-right">{analysis.civilRuling.verdict}</p>
                            <p className="text-xs text-blue-300/70 leading-relaxed italic text-right">{analysis.civilRuling.relevantLaws}</p>
                        </div>

                        {/* Connector Icon */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-[#1c1c1e] rounded-full border border-slate-700 flex items-center justify-center z-10 shadow-xl">
                            <span className="text-xs font-bold text-slate-500">VS</span>
                        </div>
                    </div>

                    {/* Conflict Zone */}
                    {(analysis.conflicts || []).length > 0 && (
                        <div className="glass-panel p-6 rounded-3xl border-l-4 border-l-red-500 bg-red-950/5">
                            <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <AlertTriangleIcon className="w-5 h-5" /> Friction Points Identified
                            </h3>
                            <div className="space-y-3">
                                {(analysis.conflicts || []).map((c, i) => (
                                    <div key={i} className="flex gap-4 items-start p-3 bg-red-500/5 rounded-xl">
                                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${c.severity === 'high' ? 'bg-red-500 animate-pulse' : 'bg-orange-400'}`}></div>
                                        <div>
                                            <h4 className="text-sm font-bold text-red-200">{c.point}</h4>
                                            <p className="text-xs text-red-300/70 mt-1">{c.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Resolution & Decision Tree */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Logic Visualizer */}
                        <div className="lg:col-span-4">
                            {analysis.decisionTree && <DecisionTreeWidget steps={analysis.decisionTree} />}
                        </div>

                        {/* Textual Strategy */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="glass-panel p-6 rounded-3xl bg-emerald-500/5 border-emerald-500/20 h-full">
                                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <CheckIcon className="w-5 h-5" /> Compliant Path Forward
                                </h3>
                                <p className="text-sm text-slate-200 leading-relaxed mb-6">
                                    {analysis.resolutionStrategy}
                                </p>
                                <div>
                                    <span className="text-xs font-bold text-slate-500 uppercase mb-2 block">Actionable Options</span>
                                    <ul className="space-y-2">
                                        {(analysis.safeOptions || []).map((opt, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                                <span className="text-emerald-500 font-bold">✓</span> {opt}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Export Tools */}
                    <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <ShieldAlertIcon className={`w-8 h-8 ${analysis.riskLevel === 'high' ? 'text-red-500' : analysis.riskLevel === 'medium' ? 'text-orange-400' : 'text-emerald-400'}`} />
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase">Legal Risk Level</h4>
                                <span className={`text-lg font-black uppercase ${analysis.riskLevel === 'high' ? 'text-red-500' : analysis.riskLevel === 'medium' ? 'text-orange-400' : 'text-emerald-400'}`}>
                                    {analysis.riskLevel}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={downloadFlowchart}
                                className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-bold uppercase transition flex items-center gap-2"
                            >
                                <FileTextIcon className="w-4 h-4" /> Save Decision Tree
                            </button>
                            <button 
                                onClick={generateCourtAnnexure}
                                className="px-4 py-2 bg-white/10 border border-white/20 hover:bg-white/20 text-white rounded-lg text-xs font-bold uppercase transition flex items-center gap-2"
                            >
                                <PrinterIcon className="w-4 h-4" /> Print Formal Annexure
                            </button>
                        </div>
                    </div>

                    {/* Feedback Widget Integration */}
                    <FeedbackWidget 
                        query={`Dual Compliance: ${scenario} in ${jurisdiction}`}
                        response={analysis}
                        category="Legal"
                    />
                </div>
            )}
        </div>
    );
};
