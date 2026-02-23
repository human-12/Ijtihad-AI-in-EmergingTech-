
import React, { useState, useEffect } from 'react';
import { getCurriculum, getStudentProfile, createStudentProfile, completeLesson, saveProfile } from '../services/educationService';
import { generateLessonContent, generateLessonQuiz, gradeCapstoneProject, facilitateEducation } from '../services/geminiService';
import type { EducationModule, EducationLesson, QuizQuestion, CapstoneGrading, UserProfile } from '../types';
import { 
    GraduationCapIcon, LockIcon, PlayIcon, CheckIcon, 
    AwardIcon, LoaderIcon, ChevronDownIcon, TrophyIcon, 
    BookOpenIcon, ArrowRightIcon, FileTextIcon, IslamicStarIcon, 
    UserIcon, BrainCircuitIcon, ScaleIcon
} from './icons';
import Markdown from 'react-markdown';

interface EducationPanelProps {
    language: 'en' | 'ar' | 'ur';
}

// --- ONBOARDING WIZARD ---
const OnboardingWizard: React.FC<{ onComplete: (data: Partial<UserProfile>) => void }> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<Partial<UserProfile>>({ goals: [] });

    const toggleGoal = (goal: string) => {
        const goals = data.goals || [];
        setData({ ...data, goals: goals.includes(goal) ? goals.filter(g => g !== goal) : [...goals, goal] });
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 animate-fade-in-down">
            <div className="glass-panel p-8 rounded-3xl text-center">
                <div className="w-20 h-20 rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 flex items-center justify-center mx-auto mb-6">
                    <IslamicStarIcon className="w-10 h-10 text-[var(--accent-gold)]" />
                </div>
                
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white">Welcome to Ijtihad Academy</h2>
                        <p className="text-slate-400">Let's personalize your learning journey. First, what are your primary goals?</p>
                        <div className="grid grid-cols-2 gap-3 text-left">
                            {['Personal Piety', 'Academic Study', 'Teaching Others', 'Research'].map(g => (
                                <button key={g} onClick={() => toggleGoal(g)} className={`p-4 rounded-xl border transition ${data.goals?.includes(g) ? 'bg-[var(--accent-gold)] text-black border-[var(--accent-gold)]' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}>
                                    {g}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setStep(2)} disabled={!data.goals?.length} className="w-full py-3 bg-white text-black font-bold rounded-xl disabled:opacity-50">Next Step</button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white">Learning Preferences</h2>
                        <div className="space-y-4 text-left">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Madhhab Focus</label>
                                <select onChange={(e) => setData({ ...data, madhhabPreference: e.target.value })} className="w-full bg-black/40 border border-slate-700 rounded-xl p-3 text-white">
                                    <option value="Comparative">Comparative (All Schools)</option>
                                    <option value="Hanafi">Hanafi</option>
                                    <option value="Maliki">Maliki</option>
                                    <option value="Shafi'i">Shafi'i</option>
                                    <option value="Hanbali">Hanbali</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Time Commitment</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Casual', 'Dedicated', 'Intensive'].map(t => (
                                        <button key={t} onClick={() => setData({ ...data, timeCommitment: t })} className={`p-3 rounded-xl border text-sm ${data.timeCommitment === t ? 'bg-[var(--accent-sage)] text-white' : 'bg-white/5 text-slate-400'}`}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => onComplete(data)} disabled={!data.timeCommitment} className="w-full py-3 bg-[var(--accent-gold)] text-black font-bold rounded-xl disabled:opacity-50">Start My Journey</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- INTERACTIVE EXERCISES ---

const MaximMatcher: React.FC<{ lessonTitle: string, onComplete: () => void, language: string, userProfile: UserProfile }> = ({ lessonTitle, onComplete, language, userProfile }) => {
    const [gameData, setGameData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [matches, setMatches] = useState<{[key: string]: string}>({});
    
    useEffect(() => {
        facilitateEducation('generate_exercise', { type: 'interactive_matching', lessonTitle }, userProfile, language)
            .then(data => { setGameData(data); setLoading(false); });
    }, []);

    const handleMatch = (scenarioId: string, maximId: string) => {
        setMatches(prev => {
            const next = { ...prev, [scenarioId]: maximId };
            // Auto-check completion
            if (Object.keys(next).length === (gameData?.pairs || []).length) {
                // Simple heuristic: if all matched, assume success for demo. Real app would validate.
                setTimeout(onComplete, 1500); 
            }
            return next;
        });
    };

    if (loading) return <div className="flex justify-center p-12"><LoaderIcon className="w-8 h-8 animate-spin text-[var(--accent-gold)]" /></div>;

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white text-center">Match the Scenario to the Legal Maxim</h3>
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase">Scenarios</h4>
                    {/* Defensive optional chaining for gameData.pairs */}
                    {gameData?.pairs?.map((p: any) => (
                        <div key={p.id} className={`p-4 rounded-xl bg-white/5 border ${matches[p.id] ? 'border-[var(--accent-sage)] bg-[var(--accent-sage)]/10' : 'border-white/10'}`}>
                            {p.scenario}
                        </div>
                    ))}
                </div>
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase">Maxims</h4>
                    {gameData?.pairs?.map((p: any) => (
                        <button 
                            key={p.maxim} 
                            onClick={() => { 
                                // Find first unmatched scenario for demo simplicity
                                const unmatched = gameData.pairs.find((x: any) => !matches[x.id]);
                                if (unmatched) handleMatch(unmatched.id, p.maxim);
                            }}
                            className="w-full p-4 rounded-xl bg-black/40 border border-slate-700 hover:border-[var(--accent-gold)] transition text-left"
                        >
                            {p.maxim}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const HadithDetective: React.FC<{ onComplete: () => void, language: string, userProfile: UserProfile }> = ({ onComplete, language, userProfile }) => {
    const [caseFile, setCaseFile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    useEffect(() => {
        facilitateEducation('generate_exercise', { type: 'interactive_grading' }, userProfile, language)
            .then(data => { setCaseFile(data); setLoading(false); });
    }, []);

    const submitJudgment = () => {
        if (selectedGrade === caseFile.correctGrade) {
            setFeedback("Correct! Your analysis aligns with the scholars of Hadith.");
            setTimeout(onComplete, 2000);
        } else {
            setFeedback(`Incorrect. ${caseFile.solutionExplanation}`);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><LoaderIcon className="w-8 h-8 animate-spin text-[var(--accent-gold)]" /></div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-amber-900/10 border border-amber-500/20 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><ScaleIcon className="w-24 h-24" /></div>
                <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                    <BrainCircuitIcon className="w-5 h-5" /> Analyze This Narration
                </h3>
                <div className="bg-black/30 p-4 rounded-xl mb-4">
                    <p className="text-xl font-serif text-center leading-loose text-white/90">{caseFile.hadithText}</p>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                    <span className="block text-xs font-bold text-slate-500 uppercase">Sanad (Chain)</span>
                    <div className="flex flex-wrap gap-2">
                        {/* Defensive optional chaining for caseFile.chain */}
                        {caseFile?.chain?.map((n: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-white/5 rounded border border-white/5">
                                {n} {i < (caseFile.chain?.length || 0) - 1 && '→'}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
                {['Sahih', 'Hasan', 'Da\'if', 'Mawdu'].map(g => (
                    <button 
                        key={g} 
                        onClick={() => setSelectedGrade(g)}
                        className={`py-3 rounded-xl font-bold transition ${selectedGrade === g ? 'bg-[var(--accent-gold)] text-black' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}
                    >
                        {g}
                    </button>
                ))}
            </div>

            {selectedGrade && (
                <button onClick={submitJudgment} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200">Submit Judgment</button>
            )}

            {feedback && (
                <div className={`p-4 rounded-xl ${feedback.startsWith('Correct') ? 'bg-emerald-900/20 text-emerald-400' : 'bg-red-900/20 text-red-400'}`}>
                    {feedback}
                </div>
            )}
        </div>
    );
};

// --- MAIN PANEL ---

export const EducationPanel: React.FC<EducationPanelProps> = ({ language }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [modules, setModules] = useState<EducationModule[]>([]);
    
    // Active State
    const [activeModule, setActiveModule] = useState<EducationModule | null>(null);
    const [activeLesson, setActiveLesson] = useState<EducationLesson | null>(null);
    const [view, setView] = useState<'dashboard' | 'lesson'>('dashboard');
    
    // Content State
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const p = getStudentProfile();
        if (p) {
            setProfile(p);
            setModules(getCurriculum());
        }
    }, []);

    const handleOnboardingComplete = (data: Partial<UserProfile>) => {
        const newProfile = createStudentProfile(data);
        setProfile(newProfile);
        setModules(getCurriculum());
    };

    const handleLessonStart = async (module: EducationModule, lesson: EducationLesson) => {
        if (lesson.isLocked) return;
        setActiveModule(module);
        setActiveLesson(lesson);
        setView('lesson');
        setLoading(true);
        setContent('');

        if (lesson.type === 'text' || lesson.type === 'video') {
            const text = await generateLessonContent(lesson.title, module.levelTitle, language);
            setContent(text);
            setLoading(false);
        } else {
            // Interactive types handle their own loading
            setLoading(false);
        }
    };

    const handleLessonComplete = () => {
        if (activeLesson) {
            completeLesson(activeLesson.id);
            // Refresh profile & curriculum
            const p = getStudentProfile();
            setProfile(p);
            setModules(getCurriculum());
            setView('dashboard');
        }
    };

    if (!profile) return <OnboardingWizard onComplete={handleOnboardingComplete} />;

    return (
        <div className="max-w-7xl mx-auto pb-20 h-[calc(100vh-150px)]">
            {view === 'dashboard' ? (
                <div className="space-y-8 animate-fade-in-down">
                    {/* Header Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="glass-panel p-6 rounded-2xl border-l-4 border-[var(--accent-gold)] bg-gradient-to-r from-[var(--accent-gold)]/10 to-transparent">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-black/30 rounded-full"><UserIcon className="w-6 h-6 text-[var(--accent-gold)]" /></div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rank</h3>
                                    <div className="text-xl font-black text-white">{profile.currentTitle}</div>
                                </div>
                            </div>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl border-l-4 border-indigo-500">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">XP Earned</h3>
                            <div className="text-2xl font-black text-white">{profile.xp.toLocaleString()}</div>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl border-l-4 border-emerald-500">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Modules</h3>
                            <div className="text-2xl font-black text-white">{profile.completedModuleIds.length} / {modules.length}</div>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl border-l-4 border-amber-500">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Streak</h3>
                            <div className="text-2xl font-black text-white">{profile.streakDays} Days</div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="relative pl-8 border-l-2 border-slate-800 space-y-12">
                        {modules.map((module, i) => (
                            <div key={module.id} className="relative">
                                {/* Timeline Node */}
                                <div className={`absolute -left-[41px] top-6 w-5 h-5 rounded-full border-4 transition-colors ${
                                    module.isCompleted ? 'bg-emerald-500 border-black' : 
                                    module.isLocked ? 'bg-slate-800 border-black' : 
                                    'bg-[var(--accent-gold)] border-black animate-pulse'
                                }`}></div>

                                <div className={`glass-panel p-6 rounded-2xl transition-all ${module.isLocked ? 'opacity-50 grayscale' : 'hover:border-[var(--accent-gold)]/30'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Level {module.levelId}</span>
                                            <h3 className="text-xl font-bold text-slate-100">{module.title}</h3>
                                            <p className="text-sm text-slate-400 mt-1">{module.description}</p>
                                        </div>
                                        {module.isCompleted ? <CheckIcon className="w-6 h-6 text-emerald-500" /> : module.isLocked && <LockIcon className="w-5 h-5 text-slate-600" />}
                                    </div>

                                    <div className="space-y-2">
                                        {module.lessons.map((lesson, j) => (
                                            <button 
                                                key={lesson.id}
                                                disabled={lesson.isLocked}
                                                onClick={() => handleLessonStart(module, lesson)}
                                                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left group ${
                                                    lesson.isCompleted ? 'bg-emerald-900/10 border-emerald-500/20' : 
                                                    lesson.isLocked ? 'bg-black/20 border-transparent cursor-not-allowed' : 
                                                    'bg-white/5 border-white/5 hover:bg-white/10'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                                        lesson.isCompleted ? 'bg-emerald-500 text-black' : 
                                                        lesson.isLocked ? 'bg-slate-800 text-slate-500' : 
                                                        'bg-[var(--accent-gold)] text-black'
                                                    }`}>
                                                        {j + 1}
                                                    </div>
                                                    <div>
                                                        <span className={`text-sm font-bold block ${lesson.isLocked ? 'text-slate-500' : 'text-slate-200'}`}>{lesson.title}</span>
                                                        <span className="text-[10px] text-slate-500 uppercase">{lesson.type.replace('_', ' ')} • {lesson.durationMinutes}m</span>
                                                    </div>
                                                </div>
                                                {!lesson.isLocked && !lesson.isCompleted && <PlayIcon className="w-4 h-4 text-slate-400 group-hover:text-white" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                // LESSON VIEW
                <div className="h-full flex flex-col animate-slide-up-fade-in">
                    <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                        <button onClick={() => setView('dashboard')} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition">
                            <ArrowRightIcon className="w-5 h-5 rotate-180" />
                        </button>
                        <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{activeModule?.title}</span>
                            <h2 className="text-xl font-bold text-white">{activeLesson?.title}</h2>
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto custom-scrollbar bg-black/20 rounded-2xl border border-white/5 p-8 relative">
                        {loading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <LoaderIcon className="w-8 h-8 text-[var(--accent-gold)] mb-4 animate-spin" />
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Consulting Knowledge Base...</p>
                            </div>
                        ) : activeLesson?.type === 'interactive_matching' ? (
                            <MaximMatcher 
                                lessonTitle={activeLesson.title} 
                                onComplete={handleLessonComplete} 
                                language={language}
                                userProfile={profile} 
                            />
                        ) : activeLesson?.type === 'interactive_grading' ? (
                            <HadithDetective 
                                onComplete={handleLessonComplete} 
                                language={language}
                                userProfile={profile}
                            />
                        ) : (
                            <div className="prose prose-invert prose-lg max-w-none">
                                <Markdown>{content}</Markdown>
                                <div className="mt-8 pt-8 border-t border-white/10 flex justify-end">
                                    <button onClick={handleLessonComplete} className="px-8 py-3 bg-[var(--accent-gold)] text-black font-bold rounded-xl hover:brightness-110 transition flex items-center gap-2">
                                        Complete Lesson <ArrowRightIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
