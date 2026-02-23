
import React, { useState, useEffect, useRef } from 'react';
import { getIkhtilafData } from '../services/geminiService';
import type { IkhtilafGraph, IkhtilafNode } from '../types';
import { LoaderIcon, SearchIcon, GitBranchIcon, ShieldCheckIcon, AlertTriangleIcon, InfoIcon, MilestoneIcon, ClockIcon } from './icons';

interface IkhtilafVisualizerProps {
    language: 'en' | 'ar' | 'ur';
}

const TimelineView: React.FC<{ graph: IkhtilafGraph }> = ({ graph }) => {
    return (
        <div className="space-y-8 p-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700 pb-2">Historical Timeline</h3>
            <div className="relative border-l-2 border-indigo-500/30 ml-4 space-y-12">
                {(graph.nodes || [])
                    .filter(n => n.timePeriod)
                    .sort((a, b) => (a.timePeriod || "").localeCompare(b.timePeriod || ""))
                    .map((node, i) => (
                        <div key={i} className="relative pl-8">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-indigo-500 bg-[#0c0e12] flex items-center justify-center">
                                <div className={`w-2 h-2 rounded-full ${node.isMajority ? 'bg-indigo-500' : 'bg-slate-500'}`}></div>
                            </div>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1 block">{node.timePeriod}</span>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <h4 className="font-bold text-slate-200 text-sm mb-1">{node.label}</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">{node.description}</p>
                                {node.scholars && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {node.scholars.map((s, j) => (
                                            <span key={j} className="text-[9px] px-2 py-0.5 bg-black/30 rounded text-slate-500">{s}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                
                {/* Critical Turning Points */}
                {graph.critical_turning_points && graph.critical_turning_points.length > 0 && (
                    <div className="pt-8">
                        <span className="text-xs font-bold text-slate-500 uppercase block mb-4 ml-8">Turning Points</span>
                        {graph.critical_turning_points.map((tp, i) => (
                            <div key={`tp-${i}`} className="relative pl-8 mb-6">
                                <div className="absolute -left-[6px] top-1 w-3 h-3 rotate-45 bg-amber-500/50"></div>
                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1 block">{tp.year}</span>
                                <div className="text-xs text-slate-300">
                                    <strong className="text-white">{tp.event}:</strong> {tp.impact}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export const IkhtilafVisualizer: React.FC<IkhtilafVisualizerProps> = ({ language }) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [graph, setGraph] = useState<IkhtilafGraph | null>(null);
    const [selectedNode, setSelectedNode] = useState<IkhtilafNode | null>(null);
    const [viewMode, setViewMode] = useState<'network' | 'timeline'>('network');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isLoading) return;

        setIsLoading(true);
        setGraph(null);
        setSelectedNode(null);

        try {
            const data = await getIkhtilafData(query, language);
            setGraph(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate positions based on consensus (size) and relationships
    const getPos = (index: number, total: number, node: IkhtilafNode) => {
        const centerX = 500;
        const centerY = 500;
        
        // Majority opinion typically center
        if (node.isMajority) return { x: centerX, y: centerY };

        // Others distributed around
        const radius = 250; 
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
        return {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-fade-in-down">
            <header className="mb-8 text-center">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
                    <GitBranchIcon className="w-8 h-8 text-indigo-400" />
                </div>
                <h2 className="text-3xl font-bold text-slate-100 uppercase tracking-wider">Ikhtilaf <span className="text-indigo-400 text-sm align-top ml-1">Mapper</span></h2>
                <p className="text-slate-400 mt-2 max-w-2xl mx-auto text-sm">
                    Navigate the complex geography of scholarly disagreement. Visualize the branching logic of Madhhabs, strength of consensus, and historical evolution.
                </p>
            </header>

            <div className="glass-panel p-6 rounded-3xl mb-8">
                <form onSubmit={handleSearch} className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter a controversial topic (e.g., 'Moon Sighting vs Calculation', 'Tawassul')..."
                        className="w-full bg-black/40 border border-slate-700 rounded-2xl p-5 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none pr-16"
                        disabled={isLoading}
                    />
                    <button 
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-indigo-500 text-black rounded-xl hover:bg-indigo-400 transition disabled:opacity-50"
                    >
                        {isLoading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <SearchIcon className="w-5 h-5" />}
                    </button>
                </form>
            </div>

            {graph && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Visualization Area */}
                    <div className="lg:col-span-3 h-[700px] glass-panel rounded-3xl relative overflow-hidden bg-black/60 border border-slate-800 flex flex-col">
                        <div className="absolute top-4 right-4 z-20 flex bg-black/40 rounded-lg p-1 border border-white/10">
                            <button 
                                onClick={() => setViewMode('network')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${viewMode === 'network' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                Network
                            </button>
                            <button 
                                onClick={() => setViewMode('timeline')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1 ${viewMode === 'timeline' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                <ClockIcon className="w-3 h-3" /> Timeline
                            </button>
                        </div>

                        {viewMode === 'network' ? (
                            <div className="w-full h-full cursor-grab active:cursor-grabbing overflow-auto p-4 flex items-center justify-center custom-scrollbar">
                                <svg 
                                    width="1000" 
                                    height="1000" 
                                    viewBox="0 0 1000 1000" 
                                    className="max-w-none shadow-2xl rounded-full bg-slate-900/30"
                                    style={{ minWidth: '1000px', minHeight: '1000px' }}
                                >
                                    <defs>
                                        <filter id="glow">
                                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                                            <feMerge>
                                                <feMergeNode in="coloredBlur"/>
                                                <feMergeNode in="SourceGraphic"/>
                                            </feMerge>
                                        </filter>
                                    </defs>

                                    {/* Edges */}
                                    {(graph.edges || []).map((edge, i) => {
                                        const nodes = graph.nodes || [];
                                        const sourceNode = nodes.find(n => n.id === edge.source);
                                        const targetNode = nodes.find(n => n.id === edge.target);
                                        if (!sourceNode || !targetNode) return null;

                                        const sPos = getPos(nodes.indexOf(sourceNode), nodes.length, sourceNode);
                                        const tPos = getPos(nodes.indexOf(targetNode), nodes.length, targetNode);

                                        return (
                                            <g key={i}>
                                                <line
                                                    x1={sPos.x} y1={sPos.y}
                                                    x2={tPos.x} y2={tPos.y}
                                                    stroke={edge.isConflict ? '#f43f5e' : '#334155'}
                                                    strokeWidth={edge.strength ? edge.strength : 2}
                                                    strokeDasharray={edge.isConflict ? '5,5' : ''}
                                                    opacity={0.6}
                                                />
                                                {/* Edge Label */}
                                                <text 
                                                    x={(sPos.x + tPos.x) / 2} 
                                                    y={(sPos.y + tPos.y) / 2} 
                                                    fill="#64748b" 
                                                    fontSize="10" 
                                                    textAnchor="middle"
                                                    className="bg-black"
                                                >
                                                    {edge.label}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* Nodes */}
                                    {(graph.nodes || []).map((node, i) => {
                                        const pos = getPos(i, (graph.nodes || []).length, node);
                                        const isActive = selectedNode?.id === node.id;
                                        
                                        // Size based on 'size' prop (1-100), default to 40 if majority, 20 otherwise
                                        const radius = node.size ? (node.size / 2) + 20 : (node.isMajority ? 50 : 25);
                                        const color = node.color || (node.isMajority ? '#22c55e' : '#94a3b8');

                                        return (
                                            <g 
                                                key={node.id} 
                                                className="cursor-pointer group hover:opacity-90"
                                                onClick={() => setSelectedNode(node)}
                                            >
                                                <circle
                                                    cx={pos.x} cy={pos.y}
                                                    r={radius}
                                                    fill={isActive ? color : `${color}20`}
                                                    stroke={color}
                                                    strokeWidth={isActive ? 4 : 2}
                                                    className="transition-all duration-300"
                                                />
                                                {node.isMajority && (
                                                    <text 
                                                        x={pos.x} y={pos.y - radius - 10} 
                                                        fill="#22c55e" fontSize="12" fontWeight="bold" 
                                                        textAnchor="middle" className="pointer-events-none uppercase tracking-widest"
                                                    >
                                                        Consensus
                                                    </text>
                                                )}
                                                
                                                {/* Text Wrapping Logic (Simplified) */}
                                                <foreignObject x={pos.x - radius} y={pos.y - radius} width={radius * 2} height={radius * 2}>
                                                    <div className="w-full h-full flex items-center justify-center text-center p-2">
                                                        <p style={{ fontSize: radius / 3.5 }} className={`font-bold leading-tight ${isActive ? 'text-white' : 'text-slate-300'}`}>
                                                            {node.label}
                                                        </p>
                                                    </div>
                                                </foreignObject>
                                            </g>
                                        );
                                    })}
                                </svg>
                            </div>
                        ) : (
                            <div className="overflow-y-auto custom-scrollbar h-full">
                                <TimelineView graph={graph} />
                            </div>
                        )}
                    </div>

                    {/* Sidebar Details */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* Consensus Dashboard */}
                        {graph.consensus_analysis && (
                            <div className="glass-panel p-5 rounded-2xl bg-indigo-900/10 border-indigo-500/20">
                                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <ShieldCheckIcon className="w-4 h-4" /> Consensus Report
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Strong Consensus</span>
                                        <p className="text-xs text-slate-200">{graph.consensus_analysis.strong_consensus}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Dispute Area</span>
                                        <p className="text-xs text-slate-200">{graph.consensus_analysis.area_of_dispute}</p>
                                    </div>
                                    {graph.consensus_analysis.modern_development && (
                                        <div className="pt-2 border-t border-white/5">
                                            <span className="text-[10px] font-bold text-amber-500 uppercase block">Modern Shift</span>
                                            <p className="text-xs text-amber-200/70">{graph.consensus_analysis.modern_development}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {selectedNode ? (
                            <div className="glass-panel p-6 rounded-3xl border-l-4 border-l-indigo-500 animate-slide-up-fade-in">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                                        <MilestoneIcon className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-100 text-sm">{selectedNode.label}</h4>
                                        <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest">{selectedNode.type}</span>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                                    {selectedNode.description}
                                </p>

                                {selectedNode.scholars && (
                                    <div className="mb-4">
                                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Proponents</h5>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedNode.scholars.map((s, i) => (
                                                <span key={i} className="text-[10px] px-2 py-1 bg-white/5 rounded text-slate-300 border border-white/5">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedNode.evidence && (
                                    <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Primary Evidence</h5>
                                        <ul className="space-y-2">
                                            {selectedNode.evidence.map((e, i) => (
                                                <li key={i} className="text-xs text-slate-400 italic">• {e}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-48 glass-panel rounded-3xl flex flex-col items-center justify-center text-slate-600 border border-dashed border-slate-700">
                                <InfoIcon className="w-8 h-8 mb-2 opacity-20" />
                                <p className="text-xs text-center px-6">Select a node to view scholarly arguments and evidence.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
