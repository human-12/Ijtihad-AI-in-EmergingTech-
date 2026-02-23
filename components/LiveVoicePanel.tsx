
import React, { useState, useEffect, useRef } from 'react';
import { MicIcon, StopCircleIcon, AudioWaveIcon, LoaderIcon, IslamicStarIcon, UserIcon, GlobeIcon } from './icons';
import { VoiceSession } from '../services/geminiService';

interface LiveVoicePanelProps {
  language: 'en' | 'ar' | 'ur';
}

export const LiveVoicePanel: React.FC<LiveVoicePanelProps> = ({ language }) => {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<{user: string, model: string}[]>([]);
  const [currentTurn, setCurrentTurn] = useState<{user: string, model: string}>({ user: '', model: '' });
  
  const sessionRef = useRef<VoiceSession | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
        if (sessionRef.current) {
            sessionRef.current.disconnect();
        }
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, currentTurn]);

  const handleToggleSession = async () => {
    if (status === 'connected' || status === 'connecting') {
        sessionRef.current?.disconnect();
        return;
    }

    setErrorMsg(null);
    setTranscript([]);
    setCurrentTurn({ user: '', model: '' });

    sessionRef.current = new VoiceSession(
        (newStatus, err) => {
            setStatus(newStatus);
            if (err) setErrorMsg(err);
        },
        (userText, modelText, complete) => {
            setCurrentTurn(prev => ({
                user: prev.user + userText,
                model: prev.model + modelText
            }));

            if (complete) {
                setCurrentTurn(prev => {
                    setTranscript(history => [...history, prev]);
                    return { user: '', model: '' };
                });
            }
        }
    );

    await sessionRef.current.connect(language);
  };

  const isLive = status === 'connected';

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-180px)] flex flex-col items-center animate-fade-in-down relative">
        
        {/* Error Notification */}
        {errorMsg && (
            <div className="absolute top-0 z-50 bg-red-900/80 border border-red-500/50 text-red-200 px-6 py-3 rounded-full backdrop-blur-md shadow-2xl animate-fade-in-down">
                <span className="text-sm font-bold flex items-center gap-2">
                    <StopCircleIcon className="w-4 h-4" /> {errorMsg}
                </span>
            </div>
        )}

        {/* Central Interaction Zone */}
        <div className="flex-grow flex flex-col items-center justify-center w-full relative z-10">
            
            {/* The "Sentient Orb" Visualizer */}
            <div className="relative group">
                {/* Outer Glow Rings (Active State) */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[var(--accent-gold)] rounded-full blur-[100px] opacity-0 transition-opacity duration-1000 ${isLive ? 'opacity-20 animate-pulse' : ''}`}></div>
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-[var(--accent-gold)]/30 opacity-0 transition-all duration-1000 ${isLive ? 'opacity-100 animate-[ping_3s_linear_infinite]' : ''}`}></div>
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full border border-[var(--accent-blue)]/20 opacity-0 transition-all duration-1000 delay-75 ${isLive ? 'opacity-100 animate-[ping_3s_linear_infinite]' : ''}`} style={{ animationDelay: '1s' }}></div>

                {/* Main Orb Button */}
                <button
                    onClick={handleToggleSession}
                    className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 z-20 overflow-hidden shadow-2xl ${
                        isLive 
                            ? 'bg-gradient-to-br from-red-500/90 to-red-700/90 scale-110 shadow-red-500/40' 
                            : status === 'connecting'
                                ? 'bg-slate-800 border-2 border-slate-600 scale-95'
                                : 'bg-gradient-to-br from-[var(--accent-gold)] to-[#8B6E4E] hover:scale-105 hover:shadow-[var(--accent-gold)]/40'
                    }`}
                >
                    {status === 'connecting' ? (
                        <LoaderIcon className="w-10 h-10 text-slate-400" />
                    ) : isLive ? (
                        <div className="flex flex-col items-center animate-fade-in-down">
                            <AudioWaveIcon className="w-10 h-10 text-white animate-pulse" />
                            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest mt-1">End</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <MicIcon className="w-10 h-10 text-black drop-shadow-sm" />
                        </div>
                    )}
                </button>
            </div>

            {/* Status Text & Hints */}
            <div className="mt-12 text-center space-y-3 h-20">
                {status === 'disconnected' && (
                    <div className="animate-fade-in-down">
                        <h2 className="text-2xl font-display font-medium text-slate-200 tracking-wide">
                            {language === 'ar' ? 'ابدأ المحادثة' : 'Begin Session'}
                        </h2>
                        <p className="text-sm text-slate-500 font-light tracking-wide uppercase">Tap the orb to speak</p>
                    </div>
                )}
                {status === 'connecting' && (
                    <div className="flex items-center gap-3 bg-black/40 px-5 py-2 rounded-full border border-white/5 animate-pulse">
                        <LoaderIcon className="w-4 h-4 text-[var(--accent-gold)]" />
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Establishing Uplink...</span>
                    </div>
                )}
                {isLive && (
                    <div className="flex items-center gap-3 bg-red-500/10 px-5 py-2 rounded-full border border-red-500/20">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Live Connection</span>
                    </div>
                )}
            </div>
        </div>

        {/* HUD Transcript Panel */}
        <div className={`w-full max-w-2xl transition-all duration-700 ease-in-out ${isLive || transcript.length > 0 ? 'opacity-100 translate-y-0 h-1/2' : 'opacity-0 translate-y-10 h-0 overflow-hidden pointer-events-none'}`}>
            <div className="bg-[#0c0e12]/80 backdrop-blur-xl border border-white/10 rounded-t-3xl h-full flex flex-col shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-[var(--accent-blue)] rounded-full"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transcript Log</span>
                    </div>
                    {isLive && <GlobeIcon className="w-4 h-4 text-slate-600 animate-pulse" />}
                </div>

                {/* Chat Area */}
                <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {transcript.length === 0 && !currentTurn.user && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                            <IslamicStarIcon className="w-12 h-12 mb-3" />
                            <p className="text-xs font-mono uppercase">Awaiting Audio Input...</p>
                        </div>
                    )}
                    
                    {transcript.map((t, i) => (
                        <div key={i} className="space-y-4">
                            {t.user && (
                                <div className="flex justify-end animate-fade-in-down">
                                    <div className="max-w-[80%] bg-slate-800/50 border border-slate-700/50 rounded-2xl rounded-tr-none px-5 py-3 text-sm text-slate-200 leading-relaxed shadow-sm">
                                        {t.user}
                                    </div>
                                </div>
                            )}
                            {t.model && (
                                <div className="flex justify-start animate-fade-in-down">
                                    <div className="max-w-[80%] bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 rounded-2xl rounded-tl-none px-5 py-3 text-sm text-[var(--text-primary)] leading-relaxed shadow-sm">
                                        <span className="block text-[9px] font-bold text-[var(--accent-gold)] uppercase mb-1 opacity-70">Ijtihad AI</span>
                                        {t.model}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Current Streaming Turn */}
                    {(currentTurn.user || currentTurn.model) && (
                        <div className="space-y-4">
                            {currentTurn.user && (
                                <div className="flex justify-end">
                                    <div className="max-w-[80%] bg-slate-800/50 border border-slate-700/50 rounded-2xl rounded-tr-none px-5 py-3 text-sm text-slate-200 leading-relaxed opacity-80">
                                        {currentTurn.user}<span className="inline-block w-1.5 h-3 ml-1 bg-slate-400 animate-pulse align-middle"></span>
                                    </div>
                                </div>
                            )}
                            {currentTurn.model && (
                                <div className="flex justify-start">
                                    <div className="max-w-[80%] bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 rounded-2xl rounded-tl-none px-5 py-3 text-sm text-[var(--text-primary)] leading-relaxed opacity-80">
                                        <span className="block text-[9px] font-bold text-[var(--accent-gold)] uppercase mb-1 opacity-70">Ijtihad AI</span>
                                        {currentTurn.model}<span className="inline-block w-1.5 h-3 ml-1 bg-[var(--accent-gold)] animate-pulse align-middle"></span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};
