
import React, { useState, useRef } from 'react';
import { analyzeVehicleImage } from '../services/geminiService';
import type { AppraisalResult } from '../types';
import { ScanIcon, LoaderIcon, CheckIcon, AlertTriangleIcon } from './icons';

export const Appraiser: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [result, setResult] = useState<AppraisalResult | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInput = useRef<HTMLInputElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => setImage(ev.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
            setResult(null);
        }
    };

    const runAnalysis = async () => {
        if (!image) return;
        setLoading(true);
        const data = await analyzeVehicleImage(image);
        setResult(data);
        setLoading(false);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-down">
            <div className="space-y-6">
                <div className="bg-[#1c1c1e] rounded-3xl border border-white/5 p-8 text-center relative overflow-hidden group cursor-pointer" onClick={() => fileInput.current?.click()}>
                    <input type="file" hidden ref={fileInput} onChange={handleUpload} accept="image/*" />
                    {image ? (
                        <img src={image} alt="Vehicle" className="w-full h-64 object-cover rounded-2xl shadow-2xl" />
                    ) : (
                        <div className="py-20 flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                                <ScanIcon className="w-8 h-8 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Upload Vehicle Photo</h3>
                            <p className="text-slate-500 mt-2 text-sm">AI Auto-Detects Make, Model & Condition</p>
                        </div>
                    )}
                    {loading && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                            <div className="scan-line top-1/2"></div>
                            <LoaderIcon className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                            <span className="text-blue-400 font-mono text-xs uppercase tracking-widest">Analyzing Geometry...</span>
                        </div>
                    )}
                </div>
                
                {image && !loading && !result && (
                    <button onClick={runAnalysis} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl uppercase tracking-widest text-sm transition">
                        Run AI Appraisal
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {result ? (
                    <div className="animate-fade-in-down space-y-6">
                        <div className="bg-[#1c1c1e] p-6 rounded-3xl border border-white/10">
                            <span className="text-xs font-mono text-slate-500 uppercase">Identification</span>
                            <h2 className="text-4xl font-black text-white mt-1 mb-2">{result.yearRange} {result.make} {result.model}</h2>
                            <div className="flex gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.marketLiquidity === 'High' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>Liquidity: {result.marketLiquidity}</span>
                                <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold">Grade: {result.conditionGrade}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-green-900/20 to-transparent border border-green-500/20 p-6 rounded-3xl">
                                <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Est. Market Value</span>
                                <div className="text-3xl font-black text-white mt-2">
                                    ${result.estimatedValue.low.toLocaleString()} - ${result.estimatedValue.high.toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-[#1c1c1e] border border-white/10 p-6 rounded-3xl">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Detected Issues</span>
                                <ul className="mt-2 space-y-1">
                                    {result.detectedDamage.length > 0 ? result.detectedDamage.map((d, i) => (
                                        <li key={i} className="text-xs text-red-400 flex items-center gap-2"><AlertTriangleIcon className="w-3 h-3" /> {d}</li>
                                    )) : <li className="text-xs text-slate-400">No visible exterior damage.</li>}
                                </ul>
                            </div>
                        </div>

                        <div className="bg-[#1c1c1e] p-6 rounded-3xl border border-white/10">
                            <h4 className="text-sm font-bold text-white mb-2">AI Analysis</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">{result.analysisReasoning}</p>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-white/5 rounded-3xl">
                        <p className="text-sm font-bold uppercase tracking-widest">Awaiting Analysis</p>
                    </div>
                )}
            </div>
        </div>
    );
};
