
import React, { useState, useEffect } from 'react';
import { 
    UserIcon, PenToolIcon, BellIcon, BookmarkIcon, SlidersIcon, 
    FeatherIcon, LoaderIcon, CheckIcon, AlertTriangleIcon, 
    ShieldAlertIcon, InfoIcon, SendIcon, PlusIcon, ScaleIcon
} from './icons';
import { 
    getScholarProfile, saveScholarProfile, getPersonalNotes, 
    savePersonalNote, deletePersonalNote, getWorkspaceAlerts 
} from '../services/historyService';
import { performOpinionContrast } from '../services/geminiService';
import type { ScholarProfile, PersonalNote, WorkspaceAlert, ContrastAnalysis } from '../types';

interface MuftiWorkspaceProps {
    language: 'en' | 'ar' | 'ur';
}

const MADHHABS = ['Hanafi', 'Shafi\'i', 'Maliki', 'Hanbali', 'Athari'];

export const MuftiWorkspace: React.FC<MuftiWorkspaceProps> = ({ language }) => {
    const [profile, setProfile] = useState<ScholarProfile>(getScholarProfile());
    const [notes, setNotes] = useState<PersonalNote[]>([]);
    const [alerts, setAlerts] = useState<WorkspaceAlert[]>([]);
    const [activeNote, setActiveNote] = useState<PersonalNote | null>(null);
    const [showProfileEdit, setShowProfileEdit] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        setNotes(getPersonalNotes());
        setAlerts(getWorkspaceAlerts());
    }, []);

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        saveScholarProfile(profile);
        setShowProfileEdit(false);
    };

    const handleSaveNote = () => {
        if (activeNote) {
            const updatedNote = { ...activeNote, lastModified: Date.now() };
            savePersonalNote(updatedNote);
            setNotes(getPersonalNotes()); // refresh list
            setActiveNote(updatedNote); // update active state
        }
    };

    const handleCreateNote = () => {
        const newNote: PersonalNote = {
            id: Date.now().toString(),
            title: 'New Opinion Draft',
            content: '',
            tags: ['Draft'],
            lastModified: Date.now()
        };
        savePersonalNote(newNote);
        setNotes(getPersonalNotes());
        setActiveNote(newNote);
    };

    const handleDeleteNote = (id: string) => {
        deletePersonalNote(id);
        setNotes(getPersonalNotes());
        if (activeNote?.id === id) setActiveNote(null);
    };

    const handleContrastAnalysis = async () => {
        if (!activeNote || !activeNote.content.trim()) return;
        setIsAnalyzing(true);
        const result = await performOpinionContrast(activeNote.content, profile, language);
        if (result) {
            const updatedNote = { ...activeNote, aiAnalysis: result };
            savePersonalNote(updatedNote);
            setActiveNote(updatedNote);
            // Simulate adding an alert if contradictory
            if (result.isContradictory) {
                // Logic to add alert to storage would go here in a real app
                const newAlert: WorkspaceAlert = {
                    id: Date.now().toString(),
                    message: `New research contradicts your opinion: "${activeNote.title}"`,
                    severity: 'warning',
                    date: Date.now(),
                    relatedNoteId: activeNote.id
                };
                setAlerts(prev => [newAlert, ...prev]);
            }
        }
        setIsAnalyzing(false);
    };

    const timeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-fade-in-down">
            {/* --- HERO PROFILE SECTION --- */}
            <div className="relative overflow-hidden rounded-3xl mb-12 shadow-2xl group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f0a] to-[#141a14] z-0"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-5 z-0"></div>
                
                {/* Decorative glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--accent-gold)] rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity duration-700"></div>

                <div className="relative z-10 p-8 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-24 h-24 rounded-full bg-[var(--accent-gold)] p-1 shadow-xl">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border-4 border-slate-800">
                            <UserIcon className="w-12 h-12 text-[var(--accent-gold)]" />
                        </div>
                    </div>
                    
                    <div className="flex-grow text-center md:text-left">
                        <h1 className="text-3xl font-display font-bold text-white mb-2">{profile.name}</h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm">
                            <span className="px-3 py-1 rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] font-bold uppercase tracking-wider">
                                {profile.madhhab}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600">
                                Usul Strictness: {Math.round(profile.usulStrictness * 100)}%
                            </span>
                        </div>
                        <p className="mt-4 text-slate-400 max-w-2xl text-sm leading-relaxed line-clamp-2 md:line-clamp-none">
                            {profile.bio}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 min-w-[200px]">
                        <button 
                            onClick={() => setShowProfileEdit(!showProfileEdit)}
                            className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white text-sm font-bold transition flex items-center justify-center gap-2"
                        >
                            <SlidersIcon className="w-4 h-4" /> Customize Settings
                        </button>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-black/40 rounded-xl p-3 border border-white/5 text-center">
                                <span className="block text-xl font-black text-white">{notes.length}</span>
                                <span className="text-[10px] text-slate-500 uppercase font-bold">Opinions</span>
                            </div>
                            <div className="flex-1 bg-black/40 rounded-xl p-3 border border-white/5 text-center relative overflow-hidden">
                                <span className="block text-xl font-black text-red-400">{alerts.length}</span>
                                <span className="text-[10px] text-slate-500 uppercase font-bold">Alerts</span>
                                {alerts.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Edit Drawer */}
                {showProfileEdit && (
                    <div className="border-t border-white/10 bg-black/20 p-6 animate-slide-up-fade-in backdrop-blur-sm">
                        <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Display Name</label>
                                <input 
                                    type="text" 
                                    value={profile.name} 
                                    onChange={e => setProfile({...profile, name: e.target.value})}
                                    className="w-full bg-black/40 border border-slate-700 rounded-lg p-3 text-slate-200 text-sm focus:ring-1 focus:ring-[var(--accent-gold)] outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Preferred Madhhab</label>
                                <select 
                                    value={profile.madhhab}
                                    onChange={e => setProfile({...profile, madhhab: e.target.value as any})}
                                    className="w-full bg-black/40 border border-slate-700 rounded-lg p-3 text-slate-200 text-sm focus:ring-1 focus:ring-[var(--accent-gold)] outline-none"
                                >
                                    {MADHHABS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Usul Strictness (Modernity vs Tradition)</label>
                                <input 
                                    type="range" min="0" max="1" step="0.1"
                                    value={profile.usulStrictness}
                                    onChange={e => setProfile({...profile, usulStrictness: parseFloat(e.target.value)})}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--accent-gold)]"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                    <span>Flexible/Modern</span>
                                    <span>Strict/Traditional</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Bio / Notes</label>
                                <input 
                                    type="text" 
                                    value={profile.bio}
                                    onChange={e => setProfile({...profile, bio: e.target.value})}
                                    className="w-full bg-black/40 border border-slate-700 rounded-lg p-3 text-slate-200 text-sm focus:ring-1 focus:ring-[var(--accent-gold)] outline-none"
                                />
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowProfileEdit(false)} className="px-4 py-2 text-slate-400 hover:text-white text-sm">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-[var(--accent-gold)] text-black font-bold rounded-lg hover:brightness-110 text-sm">Save Changes</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* --- MAIN WORKSPACE GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-400px)] min-h-[600px]">
                
                {/* LEFT RAIL: SAVED NOTES (Netflix Style) */}
                <div className="lg:col-span-3 flex flex-col space-y-6 overflow-hidden">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                            <BookmarkIcon className="w-5 h-5 text-[var(--accent-gold)]" /> My Opinions
                        </h2>
                        <button onClick={handleCreateNote} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-300 transition">
                            <PlusIcon className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {notes.map(note => (
                            <div 
                                key={note.id}
                                onClick={() => setActiveNote(note)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer group relative ${activeNote?.id === note.id ? 'bg-[var(--accent-gold)]/10 border-[var(--accent-gold)]/50' : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10'}`}
                            >
                                <h3 className={`font-bold text-sm mb-1 line-clamp-1 ${activeNote?.id === note.id ? 'text-[var(--accent-gold)]' : 'text-slate-300 group-hover:text-white'}`}>{note.title}</h3>
                                <p className="text-xs text-slate-500 line-clamp-2 mb-2">{note.content || "No content..."}</p>
                                <div className="flex justify-between items-end">
                                    <div className="flex gap-1">
                                        {note.tags.map((tag, i) => (
                                            <span key={i} className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-slate-400 border border-white/5">{tag}</span>
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-slate-600">{timeAgo(note.lastModified)}</span>
                                </div>
                                {activeNote?.id === note.id && (
                                    <div className="absolute right-2 top-2 w-2 h-2 bg-[var(--accent-gold)] rounded-full animate-pulse"></div>
                                )}
                            </div>
                        ))}
                        {notes.length === 0 && (
                            <div className="text-center py-10 text-slate-600 border border-dashed border-slate-800 rounded-xl">
                                <FeatherIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p className="text-xs">No opinions drafted yet.</p>
                            </div>
                        )}
                    </div>

                    {/* ALERTS SECTION */}
                    {alerts.length > 0 && (
                        <div className="mt-auto bg-red-900/10 border border-red-500/20 rounded-2xl p-4 max-h-[200px] overflow-y-auto">
                            <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <BellIcon className="w-3 h-3" /> Contradiction Alerts
                            </h3>
                            <div className="space-y-2">
                                {alerts.map(alert => (
                                    <div key={alert.id} className="text-xs text-red-200/80 p-2 bg-red-500/10 rounded border border-red-500/10">
                                        {alert.message}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* MAIN EDITOR AREA */}
                <div className="lg:col-span-9 flex flex-col h-full">
                    {activeNote ? (
                        <div className="flex flex-col h-full gap-6">
                            {/* Editor Panel */}
                            <div className="glass-panel p-6 rounded-3xl flex-grow flex flex-col relative overflow-hidden">
                                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
                                    <input 
                                        type="text" 
                                        value={activeNote.title}
                                        onChange={(e) => setActiveNote({...activeNote, title: e.target.value})}
                                        className="bg-transparent text-xl font-bold text-white focus:outline-none w-full placeholder-slate-600"
                                        placeholder="Opinion Title..."
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={() => handleDeleteNote(activeNote.id)} className="p-2 text-slate-500 hover:text-red-400 transition"><AlertTriangleIcon className="w-4 h-4" /></button>
                                        <button onClick={handleSaveNote} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white transition flex items-center gap-2">
                                            <CheckIcon className="w-3 h-3" /> Save Draft
                                        </button>
                                    </div>
                                </div>
                                
                                <textarea 
                                    value={activeNote.content}
                                    onChange={(e) => setActiveNote({...activeNote, content: e.target.value})}
                                    placeholder="Write your fatwa or opinion here..."
                                    className="flex-grow bg-transparent text-slate-300 resize-none focus:outline-none leading-relaxed custom-scrollbar font-serif text-lg"
                                />

                                {/* AI Actions Footer */}
                                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-xs text-slate-500 italic">Last edited: {new Date(activeNote.lastModified).toLocaleString()}</span>
                                    <button 
                                        onClick={handleContrastAnalysis}
                                        disabled={isAnalyzing}
                                        className="px-6 py-2.5 bg-[var(--accent-gold)] text-black font-bold rounded-xl hover:brightness-110 transition flex items-center gap-2 shadow-lg shadow-[var(--accent-gold)]/20 disabled:opacity-50"
                                    >
                                        {isAnalyzing ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <ScaleIcon className="w-4 h-4" />}
                                        Analyze Divergence
                                    </button>
                                </div>
                            </div>

                            {/* Analysis Panel (Conditional) */}
                            {activeNote.aiAnalysis && (
                                <div className={`glass-panel p-6 rounded-3xl animate-slide-up-fade-in border-l-4 ${activeNote.aiAnalysis.isContradictory ? 'border-red-500 bg-red-900/5' : 'border-emerald-500 bg-emerald-900/5'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className={`text-sm font-black uppercase tracking-widest flex items-center gap-2 ${activeNote.aiAnalysis.isContradictory ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {activeNote.aiAnalysis.isContradictory ? <ShieldAlertIcon className="w-5 h-5" /> : <CheckIcon className="w-5 h-5" />}
                                            {activeNote.aiAnalysis.isContradictory ? 'Divergence Detected' : 'Aligned with Classical View'}
                                        </h3>
                                        <span className="text-[10px] bg-black/30 px-3 py-1 rounded-full text-slate-400 border border-white/5">
                                            Compared against: {profile.madhhab}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Classical Position</span>
                                            <p className="text-sm text-slate-300 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                                                {activeNote.aiAnalysis.classicalPosition}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Analysis of Your Reasoning</span>
                                            <p className="text-sm text-slate-300 leading-relaxed">
                                                {activeNote.aiAnalysis.reasoning}
                                            </p>
                                        </div>
                                    </div>

                                    {activeNote.aiAnalysis.divergencePoint && (
                                        <div className="mt-4 pt-4 border-t border-white/5">
                                            <span className="text-[10px] font-bold text-[var(--accent-gold)] uppercase block mb-1">Point of Divergence</span>
                                            <p className="text-sm text-white font-medium">{activeNote.aiAnalysis.divergencePoint}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center glass-panel rounded-3xl border-2 border-dashed border-slate-800 text-slate-600 bg-black/10">
                            <PenToolIcon className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-sm font-bold uppercase tracking-widest">Workspace Ready</p>
                            <p className="text-xs mt-2">Select a note to edit or create a new opinion.</p>
                            <button onClick={handleCreateNote} className="mt-6 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition flex items-center gap-2">
                                <PlusIcon className="w-4 h-4" /> Create Draft
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
