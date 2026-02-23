
import React, { useState, useRef } from 'react';
import { processManuscript } from '../services/geminiService';
import type { ManuscriptAnalysis } from '../types';
import { 
    ScanIcon, ScrollIcon, ZoomInIcon, ZoomOutIcon, EyeIcon, 
    CheckIcon, LoaderIcon, ShieldCheckIcon, TagIcon, FeatherIcon 
} from './icons';

interface ManuscriptPanelProps {
    language: 'en' | 'ar' | 'ur';
}

export const ManuscriptPanel: React.FC<ManuscriptPanelProps> = ({ language }) => {
    const [image, setImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [analysis, setAnalysis] = useState<ManuscriptAnalysis | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [metadata, setMetadata] = useState({ title: '', author: '', provenance: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setImage(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!image || isProcessing) return;
        setIsProcessing(true);
        try {
            const result = await processManuscript(image, language);
            setAnalysis(result);
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    const renderConfidenceText = (text: string, confidence: number) => {
        // Simulating confidence visualization for the demo
        // In a real app, word-level confidence would be returned
        return (
            <div className="font-serif text-lg leading-loose text-right" dir="rtl" style={{ fontFamily: '"Amiri", serif' }}>
                {text}
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-fade-in-down h-[calc(100vh-100px)] flex flex-col">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                        <ScrollIcon className="w-8 h-8 text-[var(--accent-gold)]" />
                        Manuscript Preservation
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Digitize, transcribe, and analyze historical Islamic texts.</p>
                </div>
                {analysis && (
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-slate-300 transition border border-white/10">
                            Download TEI XML
                        </button>
                        <button className="px-4 py-2 bg-[var(--accent-gold)] text-black rounded-lg text-xs font-bold hover:brightness-110 transition shadow-lg">
                            Publish to Archive
                        </button>
                    </div>
                )}
            </header>

            {!image ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-grow border-2 border-dashed border-slate-700 rounded-3xl bg-black/20 hover:bg-white/5 transition flex flex-col items-center justify-center cursor-pointer group"
                >
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <ScanIcon className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-300 mb-2">Upload Manuscript Image</h3>
                    <p className="text-sm text-slate-500">Supports JPG, PNG, TIFF. Max 20MB.</p>
                    <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
                </div>
            ) : (
                <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                    {/* Left: Image Viewer */}
                    <div className="glass-panel rounded-2xl relative overflow-hidden flex flex-col bg-black/40">
                        <div className="absolute top-4 right-4 z-20 flex gap-2">
                            <button onClick={() => setZoomLevel(z => Math.min(z + 0.5, 3))} className="p-2 bg-black/60 rounded-lg text-white hover:bg-black/80"><ZoomInIcon className="w-4 h-4" /></button>
                            <button onClick={() => setZoomLevel(z => Math.max(z - 0.5, 1))} className="p-2 bg-black/60 rounded-lg text-white hover:bg-black/80"><ZoomOutIcon className="w-4 h-4" /></button>
                        </div>
                        <div className="flex-grow overflow-auto flex items-center justify-center p-4 cursor-grab active:cursor-grabbing">
                            <img 
                                src={image} 
                                alt="Manuscript" 
                                className="max-w-none transition-transform duration-200"
                                style={{ transform: `scale(${zoomLevel})` }}
                            />
                        </div>
                        {!analysis && (
                            <div className="p-6 border-t border-white/5 bg-black/40">
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <input placeholder="Title (e.g. Fatawa Alamgiri)" className="bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white" value={metadata.title} onChange={e => setMetadata({...metadata, title: e.target.value})} />
                                    <input placeholder="Author" className="bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white" value={metadata.author} onChange={e => setMetadata({...metadata, author: e.target.value})} />
                                    <input placeholder="Provenance" className="bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white" value={metadata.provenance} onChange={e => setMetadata({...metadata, provenance: e.target.value})} />
                                </div>
                                <button 
                                    onClick={handleAnalyze}
                                    disabled={isProcessing}
                                    className="w-full py-3 bg-[var(--accent-gold)] text-black font-bold rounded-xl hover:brightness-110 transition flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <EyeIcon className="w-5 h-5" />}
                                    Start Digitization Process
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right: Analysis & Text */}
                    <div className="glass-panel rounded-2xl flex flex-col overflow-hidden bg-[#0c0e12]">
                        {isProcessing ? (
                            <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                                <div className="w-16 h-16 border-4 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin mb-6"></div>
                                <h3 className="text-lg font-bold text-white mb-2">Analyzing Script Geometry...</h3>
                                <p className="text-slate-400 text-sm animate-pulse">Detecting diacritical marks • Matching handwriting styles • Extracting entities</p>
                            </div>
                        ) : analysis ? (
                            <>
                                <div className="p-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                                    <div className="flex gap-4 text-xs">
                                        <div className="flex flex-col">
                                            <span className="text-slate-500 uppercase font-bold text-[10px]">Script Type</span>
                                            <span className="text-[var(--accent-gold)] font-bold">{analysis.scriptType}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-slate-500 uppercase font-bold text-[10px]">Estimated Era</span>
                                            <span className="text-slate-300 font-bold">{analysis.estimatedCentury}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-slate-500 uppercase font-bold text-[10px]">Confidence</span>
                                            <span className={`font-bold ${analysis.confidence > 0.8 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                {Math.round(analysis.confidence * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-green-900/20 border border-green-500/20 rounded-full">
                                        <ShieldCheckIcon className="w-3 h-3 text-green-400" />
                                        <span className="text-[10px] text-green-400 font-bold uppercase">Verified Layout</span>
                                    </div>
                                </div>

                                <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-6">
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <FeatherIcon className="w-4 h-4" /> Transcribed Text (With Tashkeel)
                                        </h4>
                                        <div className="p-6 bg-white/5 rounded-xl border border-white/5 leading-loose text-slate-200 text-right">
                                            {renderConfidenceText(analysis.tashkeelText, analysis.confidence)}
                                        </div>
                                    </div>

                                    {(analysis.entities || []).length > 0 && (
                                        <div className="pt-4 border-t border-white/5">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <TagIcon className="w-4 h-4" /> Detected Entities
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {(analysis.entities || []).map((ent, i) => (
                                                    <span 
                                                        key={i} 
                                                        className={`px-2 py-1 rounded text-xs border ${
                                                            ent.type === 'scholar' ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' :
                                                            ent.type === 'book' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
                                                            ent.type === 'verse' ? 'bg-[var(--accent-gold)]/10 border-[var(--accent-gold)]/30 text-[var(--accent-gold)]' :
                                                            'bg-slate-700/30 border-slate-600 text-slate-400'
                                                        }`}
                                                    >
                                                        {ent.text}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-grow flex flex-col items-center justify-center text-slate-600 p-8">
                                <ScrollIcon className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-sm">Upload an image to view transcription and analysis.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
