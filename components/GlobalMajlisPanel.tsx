
import React, { useState, useRef, useEffect } from 'react';
import { facilitateMajlis } from '../services/geminiService';
import type { MajlisSession, MajlisScholar, MajlisTurn, MajlisPhase } from '../types';
import { 
    UserIcon, MessageSquareIcon, LoaderIcon, CheckIcon, 
    FileTextIcon, ScaleIcon, ShieldCheckIcon, GlobeIcon, 
    BookOpenIcon, ArrowRightIcon, GavelIcon, InfoIcon 
} from './icons';
import { FeedbackWidget } from './FeedbackWidget';

interface GlobalMajlisPanelProps {
    language: 'en' | 'ar' | 'ur';
}

const ScholarAvatar: React.FC<{ scholar: MajlisScholar; isActive: boolean }> = ({ scholar, isActive }) => (
    <div className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-500 border relative group ${isActive ? 'bg-white/10 border-white/20 scale-105' : 'bg-transparent border-transparent opacity-60 hover:opacity-100'}`}>
        <div 
            className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-lg relative ${isActive ? 'animate-pulse' : ''}`}
            style={{ borderColor: scholar.avatarColor, backgroundColor: `${scholar.avatarColor}20` }}
        >
            <UserIcon className="w-6 h-6" style={{ color: scholar.avatarColor }} />
            {isActive && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>}
        </div>
        <div className="text-center">
            <span className="text-xs font-bold text-slate-200 block">{scholar.name}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mt-0.5" style={{ color: scholar.avatarColor }}>{scholar.role}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500 mt-1 inline-block border border-white/5">{scholar.school}</span>
        </div>
        
        {/* Methodology Tooltip */}
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-black/90 p-3 rounded-lg border border-white/10 text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
            <strong className="block text-white mb-1">{scholar.school} Usul:</strong>
            {scholar.methodology || "Classical Methodology"}
        </div>
    </div>
);

export const GlobalMajlisPanel: React.FC<GlobalMajlisPanelProps> = ({ language }) => {
    const [topic, setTopic] = useState('');
    const [session, setSession] = useState<MajlisSession | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
    const [userQuestion, setUserQuestion] = useState('');
    
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [session?.transcript, activeSpeakerId]);

    const handleStart = async () => {
        if (!topic.trim() || isLoading) return;
        setIsLoading(true);
        
        try {
            // Phase 1: Framing (Moderator Intro)
            const framingData: any = await facilitateMajlis('framing', topic, undefined, language);
            
            if (framingData && framingData.scholars) {
                const newSession: MajlisSession = {
                    topic,
                    phase: 'framing',
                    scholars: framingData.scholars,
                    preliminaryEvidence: framingData.preliminaryEvidence || [],
                    transcript: [{
                        speakerId: 'facilitator',
                        content: `Honorable scholars, the question before us is: "${framingData.initialQuestion}". I have gathered preliminary evidence. Let us begin our deliberation.`,
                        timestamp: Date.now(),
                        round: 'Framing'
                    }],
                };
                setSession(newSession);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhaseStep = async (nextPhase: MajlisPhase) => {
        if (!session || isLoading) return;
        setIsLoading(true);

        try {
            const phaseData: any = await facilitateMajlis(nextPhase, session.topic, session, language);
            
            if (phaseData && phaseData.turns) {
                let updatedTranscript = [...session.transcript];
                
                // Moderator transition message
                let transitionMsg = "";
                if (nextPhase === 'opening') transitionMsg = "Round 1: Opening Positions based on Primary Texts.";
                if (nextPhase === 'cross_exam') transitionMsg = "Round 2: Cross-Examination & Methodological Critique.";
                if (nextPhase === 'synthesis') transitionMsg = "Round 3: Evidence Synthesis & Refined Positions.";
                
                if (transitionMsg) {
                    updatedTranscript.push({
                        speakerId: 'facilitator',
                        content: transitionMsg,
                        timestamp: Date.now(),
                        round: 'Moderator'
                    });
                    setSession(prev => prev ? ({ ...prev, transcript: updatedTranscript }) : null);
                    await new Promise(r => setTimeout(r, 800));
                }

                // Simulate streaming turns
                for (const turn of phaseData.turns) {
                    setActiveSpeakerId(turn.speakerId);
                    await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));
                    updatedTranscript.push({
                        ...turn,
                        timestamp: Date.now(),
                        round: nextPhase
                    });
                    setSession(prev => prev ? ({ ...prev, transcript: updatedTranscript, phase: nextPhase }) : null);
                }
                setActiveSpeakerId(null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQA = async () => {
        if (!session || !userQuestion.trim() || isLoading) return;
        setIsLoading(true);

        try {
            // Add user question to transcript immediately for UX
            const updatedTranscript = [...session.transcript, {
                speakerId: 'student',
                content: userQuestion,
                timestamp: Date.now(),
                round: 'QA'
            }];
            setSession(prev => prev ? ({ ...prev, transcript: updatedTranscript }) : null);
            setUserQuestion('');

            const qaData: any = await facilitateMajlis('qa', session.topic, session, language, userQuestion);
            
            if (qaData && qaData.turns) {
                const turn = qaData.turns[0];
                setActiveSpeakerId(turn.speakerId);
                await new Promise(r => setTimeout(r, 1500));
                updatedTranscript.push({
                    ...turn,
                    timestamp: Date.now(),
                    round: 'QA'
                });
                setSession(prev => prev ? ({ ...prev, transcript: updatedTranscript, phase: 'qa' }) : null);
                setActiveSpeakerId(null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConclusion = async () => {
        if (!session || isLoading) return;
        setIsLoading(true);

        try {
            const synthData: any = await facilitateMajlis('conclusion', session.topic, session, language);
            if (synthData) {
                setSession(prev => prev ? ({ 
                    ...prev, 
                    phase: 'conclusion',
                    finalRuling: synthData,
                    transparencyMetrics: synthData.transparencyMetrics 
                }) : null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-fade-in-down">
            <header className="mb-10 text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                    <GlobeIcon className="w-8 h-8 text-indigo-400" />
                </div>
                <h2 className="text-3xl font-bold text-slate-100 uppercase tracking-tight">Majlis <span className="text-indigo-400">al-Fiqh</span></h2>
                <p className="text-slate-400 mt-2 max-w-2xl mx-auto text-sm leading-relaxed">
                    A simulation of classical scholarly debate. Witness 4 schools of thought analyze modern issues through their unique methodologies.
                </p>
            </header>

            {!session ? (
                <div className="glass-panel p-8 rounded-3xl max-w-2xl mx-auto">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-3">Proposed Topic for Council</label>
                    <textarea 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., 'Is it permissible to use a credit card that charges interest if no Islamic banking alternative exists?'..."
                        className="w-full h-32 bg-black/40 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none mb-6 leading-relaxed"
                    />
                    <button 
                        onClick={handleStart}
                        disabled={!topic.trim() || isLoading}
                        className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50"
                    >
                        {isLoading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <UserIcon className="w-5 h-5" />}
                        Convene Council
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[750px]">
                    
                    {/* LEFT: Context & Evidence */}
                    <div className="lg:col-span-3 flex flex-col gap-4">
                        <div className="glass-panel p-5 rounded-2xl bg-black/40 border-l-4 border-l-indigo-500 h-1/2 overflow-y-auto custom-scrollbar">
                            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <BookOpenIcon className="w-4 h-4" /> Preliminary Evidence
                            </h4>
                            <ul className="space-y-3">
                                {(session.preliminaryEvidence || []).map((ev, i) => (
                                    <li key={i} className="text-xs text-slate-300 bg-white/5 p-2 rounded border border-white/5 leading-relaxed">
                                        {ev}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="glass-panel p-5 rounded-2xl h-1/2 bg-indigo-900/10 border-indigo-500/20 flex flex-col justify-center items-center text-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Council Phase</span>
                            <div className="text-xl font-bold text-white mb-1 uppercase tracking-wide">
                                {session.phase === 'framing' ? 'Framing' : 
                                 session.phase === 'opening' ? 'Round 1: Opening' : 
                                 session.phase === 'cross_exam' ? 'Round 2: Cross-Exam' :
                                 session.phase === 'synthesis' ? 'Round 3: Synthesis' :
                                 session.phase === 'qa' ? 'Round 4: Student QA' : 'Final Ruling'}
                            </div>
                            <div className="flex gap-1 mt-4">
                                {['opening', 'cross_exam', 'synthesis', 'qa', 'conclusion'].map((p, i) => {
                                    const phases = ['opening', 'cross_exam', 'synthesis', 'qa', 'conclusion'];
                                    const currIndex = phases.indexOf(session.phase);
                                    const myIndex = phases.indexOf(p);
                                    return (
                                        <div key={p} className={`w-2 h-2 rounded-full ${myIndex <= currIndex ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* CENTER: The Majlis (Discussion) */}
                    <div className="lg:col-span-6 flex flex-col glass-panel rounded-3xl overflow-hidden bg-[#0c0e12]">
                        {/* Scholars Toolbar */}
                        <div className="p-4 bg-white/5 border-b border-white/5 flex justify-center gap-2 overflow-x-auto no-scrollbar">
                            {(session.scholars || []).map(scholar => (
                                <ScholarAvatar key={scholar.id} scholar={scholar} isActive={activeSpeakerId === scholar.id} />
                            ))}
                        </div>

                        {/* Transcript */}
                        <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {(session.transcript || []).map((turn, i) => {
                                const isFacilitator = turn.speakerId === 'facilitator';
                                const isStudent = turn.speakerId === 'student';
                                const scholar = (session.scholars || []).find(s => s.id === turn.speakerId);
                                
                                return (
                                    <div key={i} className={`flex gap-4 animate-slide-up-fade-in ${isFacilitator ? 'justify-center' : isStudent ? 'justify-end' : ''}`}>
                                        {!isFacilitator && !isStudent && scholar && (
                                            <div 
                                                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold border"
                                                style={{ borderColor: scholar.avatarColor, color: scholar.avatarColor, backgroundColor: `${scholar.avatarColor}10` }}
                                            >
                                                {scholar.name.charAt(0)}
                                            </div>
                                        )}
                                        
                                        <div className={`max-w-[85%] ${isFacilitator ? 'w-full text-center' : ''}`}>
                                            {!isFacilitator && !isStudent && scholar && (
                                                <span className="text-[10px] font-bold uppercase mb-1 block opacity-70" style={{ color: scholar.avatarColor }}>
                                                    {scholar.name}
                                                </span>
                                            )}
                                            {isStudent && (
                                                <span className="text-[10px] font-bold uppercase mb-1 block opacity-70 text-right text-slate-400">
                                                    You (Student)
                                                </span>
                                            )}
                                            
                                            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                                                isFacilitator 
                                                    ? 'bg-indigo-900/20 border border-indigo-500/30 text-indigo-100 italic' 
                                                    : isStudent
                                                    ? 'bg-white/10 border border-white/20 text-white rounded-tr-none'
                                                    : 'bg-white/5 border border-white/10 text-slate-300 rounded-tl-none'
                                            }`}>
                                                {turn.content}
                                                {turn.citations && turn.citations.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                                                        {turn.citations.map((cit, j) => (
                                                            <span key={j} className="text-[10px] bg-black/30 px-2 py-1 rounded text-slate-500 font-mono">
                                                                {cit}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {isLoading && activeSpeakerId && (
                                <div className="flex justify-center py-4">
                                    <span className="flex gap-1">
                                        <span className="w-2 h-2 bg-slate-600 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-slate-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-2 h-2 bg-slate-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="p-4 border-t border-white/5 bg-black/20">
                            {session.phase === 'framing' && (
                                <button onClick={() => handlePhaseStep('opening')} disabled={isLoading} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 text-xs font-bold uppercase transition flex justify-center items-center gap-2">
                                    <GavelIcon className="w-4 h-4" /> Begin Round 1: Opening Positions
                                </button>
                            )}
                            {session.phase === 'opening' && (
                                <button onClick={() => handlePhaseStep('cross_exam')} disabled={isLoading} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 text-xs font-bold uppercase transition flex justify-center items-center gap-2">
                                    <ScaleIcon className="w-4 h-4" /> Begin Round 2: Cross-Examination
                                </button>
                            )}
                            {session.phase === 'cross_exam' && (
                                <button onClick={() => handlePhaseStep('synthesis')} disabled={isLoading} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 text-xs font-bold uppercase transition flex justify-center items-center gap-2">
                                    <ShieldCheckIcon className="w-4 h-4" /> Begin Round 3: Synthesis
                                </button>
                            )}
                            {session.phase === 'synthesis' && (
                                <button onClick={() => { setSession(prev => prev ? ({...prev, phase: 'qa'}) : null); }} disabled={isLoading} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 text-xs font-bold uppercase transition flex justify-center items-center gap-2">
                                    <UserIcon className="w-4 h-4" /> Open Floor for Student Questions
                                </button>
                            )}
                            {session.phase === 'qa' && (
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={userQuestion}
                                        onChange={(e) => setUserQuestion(e.target.value)}
                                        placeholder="Ask a specific scholar..." 
                                        className="flex-grow bg-black/40 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                        onKeyDown={(e) => e.key === 'Enter' && handleQA()}
                                    />
                                    <button onClick={handleQA} disabled={isLoading || !userQuestion.trim()} className="p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 transition disabled:opacity-50">
                                        <ArrowRightIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={handleConclusion} disabled={isLoading} className="px-4 bg-emerald-600 rounded-xl text-white font-bold text-xs uppercase hover:bg-emerald-500 transition disabled:opacity-50 whitespace-nowrap">
                                        Conclude
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Synthesis & Ruling */}
                    <div className="lg:col-span-3 flex flex-col h-full">
                        {session.finalRuling ? (
                            <div className="glass-panel p-6 rounded-3xl h-full overflow-y-auto custom-scrollbar border-l-4 border-l-emerald-500 animate-slide-up-fade-in bg-emerald-950/5">
                                <div className="flex items-center gap-2 mb-4">
                                    <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
                                    <h3 className="text-sm font-bold text-emerald-100 uppercase tracking-widest">Moderator Summary</h3>
                                </div>
                                
                                <div className="space-y-6">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Consensus & Agreement</span>
                                        <p className="text-sm font-medium text-slate-200 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                                            {session.finalRuling.majorityPosition}
                                        </p>
                                    </div>

                                    <div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Conditions</span>
                                        <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                                            {(session.finalRuling.conditions || []).map((c, i) => <li key={i}>{c}</li>)}
                                        </ul>
                                    </div>

                                    <div>
                                        <span className="text-[10px] font-bold text-amber-500 uppercase block mb-1">Pastoral Advice</span>
                                        <p className="text-xs text-slate-400 italic bg-amber-900/10 p-3 rounded-lg border border-amber-500/10">
                                            {session.finalRuling.dissentingOpinion}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-white/5">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Flexibility</span>
                                            <span className="text-xs font-bold text-emerald-400">{session.finalRuling.confidenceLevel}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <FeedbackWidget query={session.topic} response={session.finalRuling} category="Majlis" />
                                </div>
                            </div>
                        ) : (
                            <div className="h-full glass-panel rounded-3xl flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 bg-black/20 p-6 text-center">
                                <ScaleIcon className="w-12 h-12 mb-4 opacity-20" />
                                <p className="text-sm font-bold uppercase tracking-widest opacity-50">Ruling Pending</p>
                                <p className="text-xs mt-2 max-w-xs opacity-40">Complete all debate rounds to generate the final synthesis.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
