
import React, { useState, useRef, useEffect } from 'react';
import { generateFiqhOntology } from '../services/geminiService';
import type { FiqhOntology, FiqhNode, FiqhEdge } from '../types';
import { 
    NetworkIcon, LoaderIcon, SearchIcon, AlertTriangleIcon, 
    CheckIcon, ScaleIcon, BrainCircuitIcon, GitBranchIcon 
} from './icons';

interface ComputationalFiqhPanelProps {
    language: 'en' | 'ar' | 'ur';
}

const OntologyGraph: React.FC<{ ontology: FiqhOntology }> = ({ ontology }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [selectedNode, setSelectedNode] = useState<FiqhNode | null>(null);

    const nodes = ontology.nodes || [];
    const edges = ontology.edges || [];

    // Dynamic layout logic (simplified force-directed simulation placeholder)
    // In a real app, use D3.js or React Flow. Here we arrange in concentric circles.
    const nodesWithPos = nodes.map((node, i) => {
        const angle = (i / nodes.length) * 2 * Math.PI;
        const radius = node.type === 'concept' ? 0 : node.type === 'ruling' ? 150 : 250;
        return {
            ...node,
            x: 400 + radius * Math.cos(angle),
            y: 300 + radius * Math.sin(angle)
        };
    });

    const getNodeColor = (type: string) => {
        switch(type) {
            case 'concept': return '#3b82f6'; // Blue
            case 'ruling': return '#ef4444'; // Red
            case 'source': return '#eab308'; // Yellow
            case 'scholar': return '#a855f7'; // Purple
            case 'maxim': return '#14b8a6'; // Teal
            default: return '#64748b';
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow bg-[#0c0e12] rounded-2xl border border-slate-800 relative overflow-hidden">
                <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 800 600" className="cursor-crosshair">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
                        </marker>
                    </defs>
                    
                    {/* Edges */}
                    {edges.map((edge, i) => {
                        const source = nodesWithPos.find(n => n.id === edge.source);
                        const target = nodesWithPos.find(n => n.id === edge.target);
                        if (!source || !target) return null;
                        
                        return (
                            <g key={i}>
                                <line 
                                    x1={source.x} y1={source.y} 
                                    x2={target.x} y2={target.y} 
                                    stroke={edge.relation === 'contradicts' ? '#ef4444' : '#334155'} 
                                    strokeWidth="2" 
                                    strokeDasharray={edge.relation === 'analogous_to' ? '5,5' : '0'}
                                    markerEnd="url(#arrowhead)"
                                    opacity={0.6}
                                />
                                <text x={(source.x + target.x)/2} y={(source.y + target.y)/2} fill="#64748b" fontSize="10" textAnchor="middle" className="bg-black/50">{edge.relation}</text>
                            </g>
                        );
                    })}

                    {/* Nodes */}
                    {nodesWithPos.map((node) => (
                        <g 
                            key={node.id} 
                            onClick={() => setSelectedNode(node)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <circle cx={node.x} cy={node.y} r="20" fill={getNodeColor(node.type)} stroke="#1e293b" strokeWidth="2" />
                            <text x={node.x} y={node.y + 35} fill="#e2e8f0" fontSize="12" textAnchor="middle" fontWeight="bold" className="drop-shadow-md">{node.label}</text>
                            <text x={node.x} y={node.y + 48} fill="#94a3b8" fontSize="9" textAnchor="middle">{node.type.toUpperCase()}</text>
                        </g>
                    ))}
                </svg>

                {/* Node Inspector Overlay */}
                {selectedNode && (
                    <div className="absolute top-4 right-4 w-64 bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl animate-fade-in-down">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{selectedNode.type}</span>
                            <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white">&times;</button>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{selectedNode.label}</h3>
                        {selectedNode.meta?.text && <p className="text-xs text-slate-300 italic mb-2">"{selectedNode.meta.text}"</p>}
                        {selectedNode.meta?.school && <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-slate-300">{selectedNode.meta.school}</span>}
                    </div>
                )}
            </div>
        </div>
    );
};

export const ComputationalFiqhPanel: React.FC<ComputationalFiqhPanelProps> = ({ language }) => {
    const [domain, setDomain] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [ontology, setOntology] = useState<FiqhOntology | null>(null);

    const handleModel = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!domain.trim() || isLoading) return;
        setIsLoading(true);
        setOntology(null);
        try {
            const data = await generateFiqhOntology(domain, language);
            setOntology(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-fade-in-down h-[calc(100vh-100px)] flex flex-col">
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                        <NetworkIcon className="w-8 h-8 text-cyan-400" />
                        Computational Fiqh Engine
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Formal ontology modeling for Islamic jurisprudence. Map sources, rulings, and logical dependencies.
                    </p>
                </div>
            </header>

            {!ontology ? (
                <div className="flex-grow flex flex-col items-center justify-center glass-panel rounded-3xl border-2 border-dashed border-slate-700 bg-black/20">
                    <BrainCircuitIcon className="w-20 h-20 text-slate-700 mb-6" />
                    <h3 className="text-xl font-bold text-slate-300 mb-4">Initialize Knowledge Domain</h3>
                    <form onSubmit={handleModel} className="w-full max-w-md flex gap-2">
                        <input 
                            type="text" 
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="e.g., 'Cryptocurrency Trading', 'Bioethics of Cloning'..."
                            className="flex-grow bg-black/60 border border-slate-600 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none"
                            disabled={isLoading}
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading || !domain.trim()}
                            className="px-6 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition flex items-center justify-center disabled:opacity-50"
                        >
                            {isLoading ? <LoaderIcon className="w-6 h-6 animate-spin" /> : <SearchIcon className="w-6 h-6" />}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
                    {/* Sidebar: Consistency Report */}
                    <div className="lg:col-span-1 glass-panel p-5 rounded-2xl flex flex-col bg-black/40 overflow-y-auto custom-scrollbar">
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <ScaleIcon className="w-4 h-4 text-cyan-400" /> Logic Audit
                            </h3>
                            <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                                <span className="text-sm font-bold text-slate-300">Coherence Score</span>
                                <span className={`text-xl font-black ${ontology.consistencyReport?.score && ontology.consistencyReport.score > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {ontology.consistencyReport?.score}%
                                </span>
                            </div>
                        </div>

                        {ontology.consistencyReport?.contradictions && ontology.consistencyReport.contradictions.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <AlertTriangleIcon className="w-3 h-3" /> Logical Conflicts
                                </h4>
                                <ul className="space-y-2">
                                    {ontology.consistencyReport.contradictions.map((c, i) => (
                                        <li key={i} className="text-xs text-red-300/80 bg-red-900/10 p-2 rounded border border-red-900/20">
                                            {c}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="mt-auto">
                            <button 
                                onClick={() => setOntology(null)}
                                className="w-full py-3 border border-white/10 hover:bg-white/5 rounded-xl text-xs font-bold text-slate-400 uppercase transition"
                            >
                                Reset Engine
                            </button>
                        </div>
                    </div>

                    {/* Main: Ontology Visualizer */}
                    <div className="lg:col-span-3 glass-panel p-6 rounded-2xl relative">
                        <OntologyGraph ontology={ontology} />
                        
                        <div className="absolute bottom-6 left-6 flex gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 rounded-full border border-white/10">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span> <span className="text-[10px] text-slate-300 uppercase font-bold">Concept</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 rounded-full border border-white/10">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span> <span className="text-[10px] text-slate-300 uppercase font-bold">Ruling</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 rounded-full border border-white/10">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> <span className="text-[10px] text-slate-300 uppercase font-bold">Source</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
