
import React, { useState, useEffect } from 'react';
import { getDecks, getDueCards, processReview, getStats } from '../services/srsService';
import { getHadithCoaching } from '../services/geminiService';
import type { HadithCard, HadithDeck, CoachingResponse } from '../types';
import { 
    BookOpenIcon, RefreshIcon, CheckIcon, LoaderIcon, 
    LightbulbIcon, TrendingUpIcon, AwardIcon, BrainCircuitIcon 
} from './icons';

interface HadithMemorizationPanelProps {
    language: 'en' | 'ar' | 'ur';
}

const ProgressBar: React.FC<{ value: number; max: number; colorClass: string }> = ({ value, max, colorClass }) => (
    <div className="h-2 bg-slate-800 rounded-full overflow-hidden w-full">
        <div 
            className={`h-full transition-all duration-500 ${colorClass}`} 
            style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        ></div>
    </div>
);

export const HadithMemorizationPanel: React.FC<HadithMemorizationPanelProps> = ({ language }) => {
    const [view, setView] = useState<'dashboard' | 'study'>('dashboard');
    const [activeDeck, setActiveDeck] = useState<string | null>(null);
    const [dueCards, setDueCards] = useState<HadithCard[]>([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [stats, setStats] = useState(getStats());
    const [coaching, setCoaching] = useState<CoachingResponse | null>(null);
    const [isCoachingLoading, setIsCoachingLoading] = useState(false);

    useEffect(() => {
        setStats(getStats());
    }, [view]);

    const handleStartSession = (deckId: string) => {
        const cards = getDueCards(deckId);
        if (cards.length > 0) {
            setDueCards(cards);
            setActiveDeck(deckId);
            setCurrentCardIndex(0);
            setIsFlipped(false);
            setCoaching(null);
            setView('study');
        } else {
            alert("No cards due for this deck right now! Great job.");
        }
    };

    const handleRating = (rating: 'again' | 'hard' | 'good' | 'easy') => {
        if (!activeDeck || currentCardIndex >= dueCards.length) return;
        
        const card = dueCards[currentCardIndex];
        processReview(card.id, rating);

        if (currentCardIndex < dueCards.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
            setIsFlipped(false);
            setCoaching(null);
        } else {
            setView('dashboard');
            setActiveDeck(null);
        }
    };

    const handleGetHelp = async () => {
        if (isCoachingLoading || coaching) return;
        const card = dueCards[currentCardIndex];
        setIsCoachingLoading(true);
        const result = await getHadithCoaching(card.englishText, "Memorizing the Arabic matn", language);
        setCoaching(result);
        setIsCoachingLoading(false);
    };

    // --- DASHBOARD VIEW ---
    if (view === 'dashboard') {
        const decks = getDecks();
        return (
            <div className="max-w-6xl mx-auto pb-20 animate-fade-in-down">
                <header className="mb-10 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-900/30 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                        <BookOpenIcon className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-100 uppercase tracking-tight">Hifz <span className="text-emerald-400">Coach</span></h2>
                    <p className="text-slate-400 mt-2 max-w-2xl mx-auto text-sm leading-relaxed">
                        Master the Prophetic traditions using Spaced Repetition (Leitner System).
                    </p>
                </header>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-6 mb-12">
                    <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                        <div className="p-3 bg-[var(--accent-gold)]/10 rounded-full text-[var(--accent-gold)]"><RefreshIcon className="w-6 h-6" /></div>
                        <div>
                            <span className="text-2xl font-bold text-white block">{stats.dueToday}</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Due Today</span>
                        </div>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400"><CheckIcon className="w-6 h-6" /></div>
                        <div>
                            <span className="text-2xl font-bold text-white block">{stats.mastered}</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mastered</span>
                        </div>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-full text-blue-400"><TrendingUpIcon className="w-6 h-6" /></div>
                        <div>
                            <span className="text-2xl font-bold text-white block">{stats.streak} Days</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Streak</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {decks.map(deck => {
                        const dueCount = getDueCards(deck.id).length;
                        return (
                            <div key={deck.id} className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                                <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 ${deck.coverImage}`}></div>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold text-slate-100">{deck.title}</h3>
                                        {dueCount > 0 && (
                                            <span className="px-3 py-1 bg-[var(--accent-gold)] text-black text-xs font-bold rounded-full animate-pulse">
                                                {dueCount} Due
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-400 mb-6 min-h-[40px]">{deck.description}</p>
                                    
                                    <div className="mb-6">
                                        <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold mb-2">
                                            <span>Progress</span>
                                            <span>{Math.round((deck.masteredCards / deck.totalCards) * 100)}%</span>
                                        </div>
                                        <ProgressBar value={deck.masteredCards} max={deck.totalCards} colorClass="bg-emerald-500" />
                                    </div>

                                    <button 
                                        onClick={() => handleStartSession(deck.id)}
                                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-900/20 uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={dueCount === 0}
                                    >
                                        {dueCount > 0 ? 'Start Review Session' : 'All Caught Up!'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // --- STUDY VIEW ---
    const card = dueCards[currentCardIndex];
    if (!card) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col justify-center pb-20 animate-slide-up-fade-in">
            <div className="mb-6 flex justify-between items-center px-4">
                <button onClick={() => setView('dashboard')} className="text-slate-400 hover:text-white text-sm font-bold uppercase tracking-wider">
                    &larr; Exit Session
                </button>
                <div className="text-slate-500 font-mono text-sm">
                    {currentCardIndex + 1} / {dueCards.length}
                </div>
            </div>

            <div className="relative perspective-1000 w-full aspect-[4/3] md:aspect-[16/9] min-h-[400px]">
                <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    
                    {/* FRONT */}
                    <div className="absolute inset-0 backface-hidden glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center border-t-4 border-t-[var(--accent-gold)]">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Recall the Hadith</span>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">{card.title}</h2>
                        <p className="text-lg text-slate-300 italic max-w-2xl leading-relaxed">"{card.englishText}"</p>
                        <div className="mt-8">
                            <span className="text-xs text-[var(--accent-gold)] font-bold uppercase tracking-wider">Hint: Narrator</span>
                            <p className="text-sm text-slate-400 mt-1">{card.narrator}</p>
                        </div>
                        
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                            <button 
                                onClick={() => setIsFlipped(true)}
                                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-full border border-slate-600 transition"
                            >
                                Show Answer
                            </button>
                        </div>
                    </div>

                    {/* BACK */}
                    <div className="absolute inset-0 backface-hidden glass-panel rounded-3xl p-8 flex flex-col items-center rotate-y-180 border-t-4 border-t-emerald-500 bg-[#0c0e12]">
                        <div className="flex-grow flex flex-col items-center justify-center w-full">
                            <p className="text-2xl md:text-4xl text-white font-serif leading-loose text-center quran-text" dir="rtl">
                                {card.arabicText}
                            </p>
                            
                            {coaching && (
                                <div className="mt-6 p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-xl w-full max-w-lg text-left animate-fade-in-down">
                                    <div className="flex items-center gap-2 mb-2">
                                        <LightbulbIcon className="w-4 h-4 text-emerald-400" />
                                        <span className="text-xs font-bold text-emerald-400 uppercase">Coach's Tip</span>
                                    </div>
                                    <p className="text-sm text-slate-300 mb-2"><strong className="text-white">Mnemonic:</strong> {coaching.mnemonic}</p>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {coaching.linguisticBreakdown.map((w, i) => (
                                            <span key={i} className="text-xs bg-black/30 px-2 py-1 rounded text-slate-400 border border-white/5">
                                                {w.word}: {w.meaning}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-full mt-auto pt-6 border-t border-white/10">
                            <div className="grid grid-cols-4 gap-4">
                                <button onClick={() => handleRating('again')} className="py-3 rounded-xl bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 text-red-300 font-bold text-xs uppercase transition">
                                    Again <span className="block text-[9px] opacity-60 font-normal normal-case">&lt; 1 min</span>
                                </button>
                                <button onClick={() => handleRating('hard')} className="py-3 rounded-xl bg-orange-900/20 hover:bg-orange-900/40 border border-orange-500/30 text-orange-300 font-bold text-xs uppercase transition">
                                    Hard <span className="block text-[9px] opacity-60 font-normal normal-case">2 days</span>
                                </button>
                                <button onClick={() => handleRating('good')} className="py-3 rounded-xl bg-blue-900/20 hover:bg-blue-900/40 border border-blue-500/30 text-blue-300 font-bold text-xs uppercase transition">
                                    Good <span className="block text-[9px] opacity-60 font-normal normal-case">4 days</span>
                                </button>
                                <button onClick={() => handleRating('easy')} className="py-3 rounded-xl bg-emerald-900/20 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 font-bold text-xs uppercase transition">
                                    Easy <span className="block text-[9px] opacity-60 font-normal normal-case">7 days</span>
                                </button>
                            </div>
                            <div className="mt-4 text-center">
                                <button 
                                    onClick={handleGetHelp} 
                                    disabled={isCoachingLoading || !!coaching}
                                    className="text-xs font-bold text-[var(--accent-gold)] hover:text-white transition flex items-center justify-center gap-1 mx-auto disabled:opacity-50"
                                >
                                    {isCoachingLoading ? <LoaderIcon className="w-3 h-3 animate-spin" /> : <BrainCircuitIcon className="w-3 h-3" />}
                                    Ask AI Coach for Help
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
