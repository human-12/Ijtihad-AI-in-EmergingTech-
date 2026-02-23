
import React, { useState } from 'react';
import { performLabAnalysis } from '../services/geminiService';
import type { SandboxParameters, SandboxAnalysis } from '../types';
import { 
    BeakerIcon, LoaderIcon, BrainCircuitIcon, ScaleIcon, 
    LightbulbIcon, SlidersIcon, AlertTriangleIcon
} from './icons';
import { FeedbackWidget } from './FeedbackWidget';

interface LabPanelProps {
    language: 'en' | 'ar' | 'ur';
}

const PRESET_CASES = [
    { title: "Finance: Conventional Banking", content: "Should Muslims in non-Muslim countries participate in conventional banking if no Islamic alternative exists?" },
    { title: "Medical: Gelatin in Vaccines", content: "Is it permissible to use vaccines containing porcine gelatin when no alternative exists and disease risk is high?" },
    { title: "Social: Mixing (Ikhtilat)", content: "Ruling on gender mixing in professional workplaces where segregation is not practiced." }
];

export const LabPanel: React.FC<LabPanelProps> = ({ language }) => {
    const [scenario, setScenario] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<SandboxAnalysis | null>(null);
    
    // Sandbox Sliders
    const [params, setParams] = useState<SandboxParameters>({
        maslaha: 50,
        literalism: 50,
        urf: 50,
        sadd: 50,
        hardship: 50
    });

    const handleRunExperiment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!scenario.trim() || isLoading) return;

        setIsLoading(true);
        setAnalysis(null);

        try {
            const result = await performLabAnalysis(scenario, params, language);
            setAnalysis(result);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const SliderControl: React.FC<{ 
        label: string; 
        value: number; 
        onChange: (val: number) => void;
        lowLabel: string;
        highLabel: string;
        colorClass: string;
    }> = ({ label, value, onChange, lowLabel, highLabel, colorClass }) => (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
                <span className={`text-xs font-bold ${colorClass}`}>{value}%</span>
            </div>
            <input 
                type="range" min="0" max="100" step="5"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-400"
                style={{ accentColor: 'currentColor' }} // Fallback
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-medium">
                <span>{lowLabel}</span>
                <span>{highLabel}</span>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-fade-in-down">
            <header className="mb-10 text-center">
                <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                    <BeakerIcon className="w-8 h-8 text-cyan-400" />
                </div>
                <h2 className="text-3xl font-bold text-slate-100 uppercase tracking-tight">Ijtihad <span className="text-cyan-400">Sandbox</span></h2>
                <p className="text-slate-400 mt-2 max-w-2xl mx-auto text-sm leading-relaxed">
                    An experimental engine for scholars. Adjust jurisprudential weights to see how they influence rulings on modern issues.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-900/20 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold uppercase tracking-widest">
                    <SlidersIcon className="w-3 h-3" /> Educational Simulation
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* CONTROL PANEL (Left) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-panel p-6 rounded-3xl border-l-4 border-cyan-500 bg-black/40">
                        <h3 className="text-sm font-bold text-slate-200 mb-6 flex items-center gap-2">
                            <SlidersIcon className="w-4 h-4 text-cyan-400" /> Usul Variables
                        </h3>
                        
                        <div className="space-y-8">
                            <SliderControl 
                                label="Maslaha (Public Interest)"
                                value={params.maslaha}
                                onChange={(v) => setParams({...params, maslaha: v})}
                                lowLabel="Ignore"
                                highLabel="Priority"
                                colorClass="text-emerald-400"
                            />
                            <SliderControl 
                                label="Literal vs. Spirit"
                                value={params.literalism}
                                onChange={(v) => setParams({...params, literalism: v})}
                                lowLabel="Strict Text"
                                highLabel="Maqasid"
                                colorClass="text-indigo-400"
                            />
                            <SliderControl 
                                label="Custom ('Urf)"
                                value={params.urf}
                                onChange={(v) => setParams({...params, urf: v})}
                                lowLabel="Irrelevant"
                                highLabel="Determinative"
                                colorClass="text-amber-400"
                            />
                            <SliderControl 
                                label="Blocking Means (Sadd)"
                                value={params.sadd}
                                onChange={(v) => setParams({...params, sadd: v})}
                                lowLabel="Allow Means"
                                highLabel="Block Harm"
                                colorClass="text-red-400"
                            />
                            <SliderControl 
                                label="Hardship (Raf' al-Haraj)"
                                value={params.hardship}
                                onChange={(v) => setParams({...params, hardship: v})}
                                lowLabel="No Concession"
                                highLabel="Max Ease"
                                colorClass="text-cyan-400"
                            />
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-3xl">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Quick Scenarios</h3>
                        <div className="space-y-2">
                            {PRESET_CASES.map((pc, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setScenario(pc.content)}
                                    className="w-full text-left p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/10 transition group"
                                >
                                    <span className="text-[10px] font-bold text-cyan-500 block mb-1">{pc.title}</span>
                                    <p className="text-xs text-slate-400 group-hover:text-slate-200 line-clamp-2">{pc.content}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* OUTPUT PANEL (Right) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="glass-panel p-6 rounded-3xl">
                        <form onSubmit={handleRunExperiment}>
                            <textarea 
                                value={scenario}
                                onChange={(e) => setScenario(e.target.value)}
                                placeholder="Describe a contemporary issue to test..."
                                className="w-full h-32 bg-black/40 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none resize-none mb-4 leading-relaxed"
                            />
                            <div className="flex justify-end">
                                <button 
                                    type="submit"
                                    disabled={isLoading || !scenario.trim()}
                                    className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-500 transition shadow-lg shadow-cyan-600/20 flex items-center gap-2 disabled:opacity-50 uppercase tracking-widest text-xs"
                                >
                                    {isLoading ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <BrainCircuitIcon className="w-4 h-4" />}
                                    Run Simulation
                                </button>
                            </div>
                        </form>
                    </div>

                    {analysis ? (
                        <div className="animate-slide-up-fade-in space-y-6">
                            {/* Ruling Card */}
                            <div className="glass-panel p-8 rounded-3xl border-t-4 border-t-cyan-500 bg-cyan-900/5">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">{analysis.ruling}</h3>
                                        <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30">
                                            Confidence: {analysis.confidence}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Methodology Match</span>
                                        <span className="text-sm font-bold text-slate-300">{analysis.madhhabSimilitude}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                        <ScaleIcon className="w-4 h-4" /> Weighted Reasoning
                                    </h4>
                                    <div className="grid gap-3">
                                        {analysis.reasoningPoints.map((point, i) => (
                                            <div key={i} className="p-4 bg-black/20 rounded-xl border border-white/5 flex gap-4">
                                                <div className="w-1 bg-cyan-500/50 rounded-full shrink-0"></div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-cyan-400 uppercase block mb-1">{point.variable}</span>
                                                    <p className="text-sm text-slate-300 leading-relaxed">{point.impact}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Teaching Moment */}
                            <div className="glass-panel p-6 rounded-3xl bg-amber-500/5 border-amber-500/20 flex gap-4">
                                <div className="shrink-0 pt-1">
                                    <LightbulbIcon className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-2">Educational Insight</h4>
                                    <p className="text-sm text-slate-300 leading-loose italic">
                                        "{analysis.educationalInsight}"
                                    </p>
                                </div>
                            </div>

                            <FeedbackWidget 
                                query={`Sandbox: ${scenario}. Params: ${JSON.stringify(params)}`}
                                response={analysis}
                                category="IjtihadSandbox"
                            />
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 min-h-[300px] border-2 border-dashed border-slate-800 rounded-3xl">
                            <SlidersIcon className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-sm font-bold uppercase tracking-[0.2em]">Ready to Simulate</p>
                            <p className="text-xs opacity-50 mt-2">Adjust sliders and input a scenario to begin.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
