
import React, { useState, useEffect, useRef } from 'react';
import { generateDebateTurn } from '../services/geminiService';
import type { DebateAgent, DebateMessage, DebateState } from '../types';
import { MessageSquareIcon, LoaderIcon, SendIcon, GavelIcon, ScaleIcon, UserIcon, AudioWaveIcon, BrainCircuitIcon } from './icons';
import { FeedbackWidget } from './FeedbackWidget';

const AGENTS: DebateAgent[] = [
    {
        id: 'hanafi',
        name: 'Imam al-Kasani (Hanafi)',
        school: 'Hanafi',
        color: '#0a84ff',
        usul: 'Emphasis on Istihsan (juridical preference), Qiyas (analogy), and ' + "'Urf (custom)."
    },
    {
        id: 'maliki',
        name: 'Imam al-Shatibi (Maliki)',
        school: 'Maliki',
        color: '#22c55e',
        usul: 'Focus on Maslaha Mursala (public interest) and the Practice of the People of Medina.'
    },
    {
        id: 'shafii',
        name: 'Imam al-Nawawi (Shafi\'i)',
        school: 'Shafi\'i',
        color: '#a855f7',
        usul: 'Strict adherence to authenticated Hadith and systematic analogy based on linguistic precision.'
    },
    {
        id: 'hanbali',
        name: 'Imam Ibn Qudamah (Hanbali)',
        school: 'Hanbali',
        color: '#eab308',
        usul: 'Priority to the literal text of Quran and Hadith, rejecting weak Qiyas.'
    }
];

const MODERATOR: DebateAgent = {
    id: 'moderator',
    name: 'Grand Mufti (Moderator)',
    school: 'Multi-Madhhab',
    color: '#f8fafc',
    usul: 'Synthesizing all schools to find consensus or define stable ikhtilaf.'
};

const AnimatedBars: React.FC<{ color: string }> = ({ color }) => (
    <div className="flex items-end gap-0.5 h-5 w-5 justify-center">
        <div className="w-1 bg-current rounded-full animate-[bounce_1s_infinite]" style={{ backgroundColor: color, animationDelay: '0s', height: '40%' }}></div>
        <div className="w-1 bg-current rounded-full animate-[bounce_1s_infinite]" style={{ backgroundColor: color, animationDelay: '0.2s', height: '100%' }}></div>
        <div className="w-1 bg-current rounded-full animate-[bounce_1s_infinite]" style={{ backgroundColor: color, animationDelay: '0.4s', height: '60%' }}></div>
    </div>
);

interface DebateSimulationPanelProps {
    language: 'en' | 'ar' | 'ur';
}

export const DebateSimulationPanel: React.FC<DebateSimulationPanelProps> = ({ language }) => {
    const [question, setQuestion] = useState('');
    const [isSimulating, setIsSimulating] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [debateState, setDebateState] = useState<DebateState | null>(null);
    const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [debateState?.messages, activeAgentId, isThinking]);

    const runDebate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || isSimulating) return;

        setIsSimulating(true);
        setIsThinking(false);
        const initialState: DebateState = {
            question,
            messages: [],
            consensusLevel: 10,
            isComplete: false
        };
        setDebateState(initialState);

        const currentMessages: DebateMessage[] = [];

        // Helper to process a specific turn in the debate
        const processTurn = async (agent: DebateAgent, round: number) => {
            setActiveAgentId(agent.id);
            setIsThinking(true);
            const text = await generateDebateTurn(question, agent, currentMessages, AGENTS, language);
            setIsThinking(false);
            
            const newMessage: DebateMessage = {
                agentId: agent.id,
                text,
                round,
                timestamp: Date.now()
            };
            currentMessages.push(newMessage);
            setDebateState(prev => prev ? ({ ...prev, messages: [...currentMessages] }) : null);
            
            // Visual pause to represent the agent 'speaking' their provided answer
            await new Promise(r => setTimeout(r, 2000));
        };

        // Round 1: Opening Statements (All 4 schools)
        for (const agent of AGENTS) {
            await processTurn(agent, 1);
        }

        // Round 2: Rebuttals (Choose top 2 for brevity in this simulation)
        setDebateState(prev => prev ? ({ ...prev, consensusLevel: 30 }) : null);
        for (let i = 0; i < 2; i++) {
            await processTurn(AGENTS[i], 2);
        }

        // Final Round: Moderator Summary
        setDebateState(prev => prev ? ({ ...prev, consensusLevel: 65 }) : null);
        await processTurn(MODERATOR, 3);
        
        setDebateState(prev => prev ? ({ 
            ...prev, 
            isComplete: true,
            consensusLevel: 100 
        }) : null);
        
        setActiveAgentId(null);
        setIsThinking(false);
        setIsSimulating(false);
    };

    const activeAgent = activeAgentId ? [...AGENTS, MODERATOR].find(a => a.id === activeAgentId) : null;

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-fade-in-down">
            <header className="mb-8 text-center">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-4">
                    <MessageSquareIcon className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-3xl font-bold text-slate-100 uppercase tracking-wider">Madhhab Debate <span className="text-purple-400 text-sm align-top ml-1">Sim</span></h2>
                <p className="text-slate-400 mt-2 max-w-2xl mx-auto text-sm">
                    Simulate real jurisprudential discourse. Multiple AI agents representing different Madhhabs debate a topic until they reach a consensus or stable disagreement.
                </p>
            </header>

            {!debateState ? (
                <div className="glass-panel p-8 rounded-3xl max-w-2xl mx-auto text-center">
                    <form onSubmit={runDebate}>
                        <h3 className="text-xl font-bold text-slate-200 mb-4">Enter Debate Topic</h3>
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="e.g., 'Is the consumption of synthetic laboratory-grown meat permissible?' or 'The ruling on organ donation'..."
                            className="w-full bg-black/40 border border-slate-700 rounded-2xl p-5 text-slate-200 focus:ring-2 focus:ring-purple-500 outline-none h-32 resize-none mb-6 leading-relaxed"
                        />
                        <button 
                            type="submit"
                            disabled={isSimulating || !question.trim()}
                            className="w-full py-4 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-500 transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSimulating ? <LoaderIcon className="w-6 h-6" /> : <GavelIcon className="w-6 h-6" />}
                            CONVENE SCHOLARLY COUNCIL
                        </button>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[700px]">
                    {/* Debate Participants Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-purple-500">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Participants</h4>
                            <div className="space-y-4">
                                {[...AGENTS, MODERATOR].map(agent => (
                                    <div key={agent.id} className={`flex items-center gap-3 transition-all duration-500 p-2 rounded-xl border border-transparent ${activeAgentId === agent.id ? 'bg-white/5 border-white/10 scale-105' : activeAgentId ? 'opacity-40' : 'opacity-100'}`}>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all relative ${activeAgentId === agent.id ? 'shadow-[0_0_15px_' + agent.color + '40]' : ''}`} style={{ borderColor: agent.color, backgroundColor: `${agent.color}10` }}>
                                            {activeAgentId === agent.id ? (
                                                isThinking ? (
                                                    <div className="animate-pulse">
                                                        <BrainCircuitIcon className="w-6 h-6" style={{ color: agent.color }} />
                                                    </div>
                                                ) : (
                                                    <div className="relative z-10">
                                                        <AnimatedBars color={agent.color} />
                                                    </div>
                                                )
                                            ) : (
                                                <UserIcon className="w-6 h-6" style={{ color: agent.color }} />
                                            )}
                                            
                                            {/* Ping effect when active */}
                                            {activeAgentId === agent.id && (
                                                <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: agent.color }}></span>
                                            )}
                                        </div>
                                        
                                        <div className="flex flex-col">
                                            <span className={`text-xs font-bold leading-tight transition-colors ${activeAgentId === agent.id ? 'text-white' : 'text-slate-200'}`}>{agent.name}</span>
                                            <span className="text-[10px] uppercase font-bold" style={{ color: agent.color }}>{agent.school}</span>
                                        </div>
                                        
                                        {activeAgentId === agent.id && (
                                            <div className="ml-auto flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-full border border-white/5 shadow-sm">
                                                {isThinking ? (
                                                    <>
                                                        <LoaderIcon className="w-3 h-3 text-slate-400 animate-spin" />
                                                    </>
                                                ) : (
                                                    <>
                                                        <AudioWaveIcon className="w-3 h-3 animate-pulse" style={{ color: agent.color }} />
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-panel p-5 rounded-2xl">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Consensus Level</h4>
                            <div className="space-y-2">
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-purple-500 transition-all duration-1000" 
                                        style={{ width: `${debateState.consensusLevel}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                    <span>IKHTILAF</span>
                                    <span>IJMA</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => { if(!isSimulating) { setDebateState(null); setQuestion(''); } }}
                            disabled={isSimulating}
                            className="w-full py-3 bg-white/5 border border-white/10 text-slate-400 rounded-xl hover:bg-white/10 hover:text-white transition text-sm font-bold uppercase disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            New Session
                        </button>
                    </div>

                    {/* Main Debate Area */}
                    <div className="lg:col-span-3 flex flex-col h-full glass-panel rounded-3xl overflow-hidden bg-black/40">
                        <div className="p-4 bg-slate-900/50 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ScaleIcon className="w-5 h-5 text-purple-400" />
                                <span className="text-sm font-bold text-slate-300">Case deliberation: <span className="text-slate-500 italic">"{debateState.question}"</span></span>
                            </div>
                            <div className="px-3 py-1 bg-purple-500/10 rounded-full text-[10px] font-bold text-purple-400 border border-purple-500/20">
                                ROUND {debateState.messages.length > 0 ? debateState.messages[debateState.messages.length - 1].round : 1}
                            </div>
                        </div>

                        <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {debateState.messages.map((msg, i) => {
                                const agent = msg.agentId === 'moderator' ? MODERATOR : AGENTS.find(a => a.id === msg.agentId)!;
                                const isMod = msg.agentId === 'moderator';
                                
                                return (
                                    <div key={i} className={`flex gap-4 animate-slide-up-fade-in ${isMod ? 'flex-col items-center max-w-full' : ''}`}>
                                        {!isMod && (
                                            <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center border-2 mt-1 shadow-inner" style={{ borderColor: agent.color, backgroundColor: `${agent.color}20` }}>
                                                <UserIcon className="w-5 h-5" style={{ color: agent.color }} />
                                            </div>
                                        )}
                                        <div className={`flex flex-col ${isMod ? 'w-full' : 'max-w-[85%]'}`}>
                                            {!isMod && <span className="text-[10px] font-bold uppercase mb-1" style={{ color: agent.color }}>{agent.name}</span>}
                                            <div className={`p-5 rounded-2xl text-sm leading-relaxed border transition-all ${
                                                isMod 
                                                    ? 'bg-purple-900/10 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.1)] text-slate-200' 
                                                    : 'bg-black/40 border-white/5 text-slate-300 shadow-lg'
                                            }`}>
                                                {isMod && (
                                                    <div className="flex items-center justify-center gap-2 mb-4">
                                                        <div className="h-px bg-purple-500/30 flex-grow"></div>
                                                        <span className="text-xs font-bold text-purple-400 uppercase tracking-[0.2em] px-4">Consensus Summary</span>
                                                        <div className="h-px bg-purple-500/30 flex-grow"></div>
                                                    </div>
                                                )}
                                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {isThinking && activeAgentId && activeAgent && (
                                <div className="flex gap-4 animate-slide-up-fade-in items-start">
                                    {!activeAgentId.includes('moderator') && (
                                        <div className="w-10 h-10 rounded-full shrink-0 border-2 border-dashed flex items-center justify-center mt-1 relative" style={{ borderColor: activeAgent.color, backgroundColor: `${activeAgent.color}10` }}>
                                            <div className="absolute inset-0 rounded-full border-t-2 border-current opacity-50 animate-[spin_3s_linear_infinite]" style={{ color: activeAgent.color }}></div>
                                            <BrainCircuitIcon className="w-5 h-5 animate-pulse" style={{ color: activeAgent.color }} />
                                        </div>
                                    )}
                                    <div className={`flex flex-col ${activeAgentId === 'moderator' ? 'w-full items-center' : 'max-w-[85%] w-full'}`}>
                                        {!activeAgentId.includes('moderator') && (
                                            <span className="text-[10px] font-bold uppercase mb-1 flex items-center gap-2" style={{ color: activeAgent.color }}>
                                                {activeAgent.name} <span className="text-slate-500 animate-pulse">is formulating dalil...</span>
                                            </span>
                                        )}
                                        <div className={`p-5 rounded-2xl bg-white/5 border border-dashed border-white/10 w-full flex flex-col items-center justify-center gap-3 min-h-[100px] relative overflow-hidden ${activeAgentId === 'moderator' ? 'bg-purple-900/5 border-purple-500/20' : ''}`}>
                                            {/* Shimmer effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                                            
                                            <div className="flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest relative z-10">Constructing Jurisprudential Argument</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Feedback Widget for Debate Results */}
                            {debateState.isComplete && (
                                <FeedbackWidget 
                                    query={`Debate Topic: ${question}`}
                                    response={debateState.messages}
                                    category="Debate"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
