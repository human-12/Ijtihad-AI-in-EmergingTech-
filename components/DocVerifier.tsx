
import React, { useState, useRef } from 'react';
import { verifyDocument } from '../services/geminiService';
import type { DocumentVerification } from '../types';
import { FileTextIcon, LoaderIcon, CheckIcon, ShieldAlertIcon } from './icons';

export const DocVerifier: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [result, setResult] = useState<DocumentVerification | null>(null);
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

    const runVerification = async () => {
        if (!image) return;
        setLoading(true);
        const data = await verifyDocument(image, "Vehicle Title");
        setResult(data);
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 animate-fade-in-down">
            <h2 className="text-2xl font-bold text-white mb-6">Digital Title Transfer & Compliance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div 
                    onClick={() => fileInput.current?.click()}
                    className="border-2 border-dashed border-slate-700 rounded-3xl h-80 flex flex-col items-center justify-center bg-black/20 hover:bg-white/5 cursor-pointer transition relative overflow-hidden"
                >
                    <input type="file" hidden ref={fileInput} onChange={handleUpload} accept="image/*" />
                    {image ? (
                        <img src={image} className="w-full h-full object-contain opacity-50" />
                    ) : (
                        <div className="text-center">
                            <FileTextIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold">Upload Title / Registration</p>
                        </div>
                    )}
                    {loading && <div className="absolute inset-0 bg-black/80 flex items-center justify-center"><LoaderIcon className="w-10 h-10 animate-spin text-blue-500" /></div>}
                </div>

                <div className="space-y-6">
                    {!result ? (
                        <div className="h-full flex items-center justify-center text-slate-600 bg-[#1c1c1e] rounded-3xl border border-white/5">
                            <p>Upload document to verify</p>
                        </div>
                    ) : (
                        <div className="bg-[#1c1c1e] rounded-3xl border border-white/10 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-white">Analysis Result</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.complianceStatus === 'Pass' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                                    {result.complianceStatus}
                                </span>
                            </div>
                            
                            <div className="space-y-4 font-mono text-sm text-slate-300">
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-slate-500">VIN</span>
                                    <span>{result.fields?.vin || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-slate-500">Owner</span>
                                    <span>{result.fields?.ownerName || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-slate-500">State</span>
                                    <span>{result.fields?.state || 'N/A'}</span>
                                </div>
                            </div>

                            {result.flags && result.flags.length > 0 && (
                                <div className="mt-6 p-4 bg-red-900/20 border border-red-500/20 rounded-xl">
                                    <span className="text-xs font-bold text-red-400 uppercase flex items-center gap-2 mb-2"><ShieldAlertIcon className="w-4 h-4"/> Risk Flags</span>
                                    <ul className="text-xs text-red-300 space-y-1">
                                        {result.flags.map((f, i) => <li key={i}>• {f}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {image && !loading && !result && (
                        <button onClick={runVerification} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl">Verify Document</button>
                    )}
                </div>
            </div>
        </div>
    );
};
