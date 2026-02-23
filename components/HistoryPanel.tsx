
import React from 'react';
import type { History, QASession, ResearchTopic } from '../types';
import { HistoryIcon, TrashIcon, ClockIcon, ArrowRightIcon, BookOpenCheckIcon, LightbulbIcon } from './icons';

interface HistoryPanelProps {
  history: History;
  onSelectQA: (session: QASession) => void;
  onSelectResearch: (topic: string) => void;
  onClearHistory: () => void;
  language: 'en' | 'ar' | 'ur';
}

const timeAgo = (timestamp?: number) => {
    if (!timestamp) return '';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
};

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelectQA, onSelectResearch, onClearHistory, language }) => {

  const handleClear = () => {
    const confirmMessage = language === 'ar' ? 'هل أنت متأكد أنك تريد مسح كل السجل؟' 
                         : language === 'ur' ? 'کیا آپ واقعی تمام ہسٹری صاف کرنا چاہتے ہیں؟'
                         : 'Are you sure you want to clear all history?';
    if (window.confirm(confirmMessage)) {
      onClearHistory();
    }
  };

  const qaHistory = history?.qa || [];
  const resHistory = history?.research || [];
  const hasHistory = qaHistory.length > 0 || resHistory.length > 0;

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-fade-in-down">
        <header className="flex justify-between items-end mb-10 border-b border-[var(--panel-border)] pb-6">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-[var(--accent-gold)]/10 rounded-lg border border-[var(--accent-gold)]/20">
                        <HistoryIcon className="w-6 h-6 text-[var(--accent-gold)]" />
                    </div>
                    <h2 className="text-3xl font-display font-medium text-[var(--text-primary)] tracking-wide">
                        {language === 'ar' ? 'الأرشيف التاريخي' : language === 'ur' ? 'تاریخی آرکائیو' : 'Historical Archives'}
                    </h2>
                </div>
                <p className="text-sm text-[var(--text-secondary)] font-light max-w-lg">
                    {language === 'ar' ? 'استعرض أبحاثك السابقة وجلسات الأسئلة.' : 'Review your past jurisprudential inquiries and research sessions.'}
                </p>
            </div>
            {hasHistory && (
                <button 
                    onClick={handleClear}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-[var(--accent-error)] bg-[var(--accent-error)]/10 border border-[var(--accent-error)]/20 rounded-xl hover:bg-[var(--accent-error)]/20 transition-all"
                >
                    <TrashIcon className="w-4 h-4" />
                    {language === 'ar' ? 'مسح السجل' : 'Clear All'}
                </button>
            )}
        </header>
        
        {hasHistory ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Q&A Column */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <LightbulbIcon className="w-5 h-5 text-[var(--accent-gold)]" />
                        <h3 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-wider">
                            {language === 'ar' ? 'سجل الفتاوى' : 'Inquiry Logs'}
                        </h3>
                        <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-subtle)] px-2 py-1 rounded-full border border-[var(--panel-border)]">
                            {qaHistory.length}
                        </span>
                    </div>
                    
                    <div className="space-y-3">
                        {qaHistory.map((session, index) => (
                            <button 
                                key={index}
                                onClick={() => onSelectQA(session)}
                                className="w-full text-left glass-panel p-5 rounded-2xl group transition-all hover:translate-x-1"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold text-[var(--accent-gold)] uppercase tracking-widest bg-[var(--accent-gold)]/10 px-2 py-1 rounded border border-[var(--accent-gold)]/20">
                                        Fatwa Inquiry
                                    </span>
                                    {session.timestamp && (
                                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                                            <ClockIcon className="w-3 h-3" />
                                            {timeAgo(session.timestamp)}
                                        </div>
                                    )}
                                </div>
                                <h4 className="text-sm font-medium text-[var(--text-primary)] leading-relaxed line-clamp-2 group-hover:text-[var(--accent-sage)] transition-colors">
                                    {session.question}
                                </h4>
                                <div className="mt-3 flex items-center justify-between border-t border-[var(--panel-border)] pt-3">
                                    <span className="text-[10px] text-[var(--text-secondary)] italic truncate max-w-[80%]">
                                        {session.answer.substring(0, 60)}...
                                    </span>
                                    <ArrowRightIcon className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-gold)] transition-transform group-hover:translate-x-1" />
                                </div>
                            </button>
                        ))}
                        {qaHistory.length === 0 && (
                            <div className="p-8 text-center border-2 border-dashed border-[var(--panel-border)] rounded-2xl opacity-50">
                                <p className="text-sm text-[var(--text-muted)]">No inquiries recorded.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Research Column */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpenCheckIcon className="w-5 h-5 text-[var(--accent-sage)]" />
                        <h3 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-wider">
                            {language === 'ar' ? 'سجل البحث' : 'Research Topics'}
                        </h3>
                        <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-subtle)] px-2 py-1 rounded-full border border-[var(--panel-border)]">
                            {resHistory.length}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {resHistory.map((item, index) => (
                            <button 
                                key={index}
                                onClick={() => onSelectResearch(item.topic)}
                                className="w-full text-left glass-panel p-5 rounded-2xl group transition-all hover:translate-x-1 bg-[var(--bg-subtle)]/50"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold text-[var(--accent-sage)] uppercase tracking-widest bg-[var(--accent-sage)]/10 px-2 py-1 rounded border border-[var(--accent-sage)]/20">
                                        Deep Research
                                    </span>
                                    {item.timestamp && (
                                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                                            <ClockIcon className="w-3 h-3" />
                                            {timeAgo(item.timestamp)}
                                        </div>
                                    )}
                                </div>
                                <h4 className="text-lg font-display text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent-sage)] transition-colors">
                                    {item.topic}
                                </h4>
                                <div className="mt-2 flex justify-end">
                                    <ArrowRightIcon className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-sage)] transition-transform group-hover:translate-x-1" />
                                </div>
                            </button>
                        ))}
                        {resHistory.length === 0 && (
                            <div className="p-8 text-center border-2 border-dashed border-[var(--panel-border)] rounded-2xl opacity-50">
                                <p className="text-sm text-[var(--text-muted)]">No research topics recorded.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        ) : (
            <div className="h-96 flex flex-col items-center justify-center glass-panel rounded-3xl border-2 border-dashed border-[var(--panel-border)]">
                <div className="w-20 h-20 bg-[var(--bg-subtle)] rounded-full flex items-center justify-center mb-6 border border-[var(--panel-border)]">
                    <HistoryIcon className="w-10 h-10 text-[var(--text-muted)] opacity-50" />
                </div>
                <h3 className="text-2xl font-display text-[var(--text-primary)] mb-2">
                    {language === 'ar' ? 'السجل فارغ' : 'The Archives are Empty'}
                </h3>
                <p className="text-[var(--text-secondary)] text-sm max-w-xs text-center leading-relaxed">
                    {language === 'ar' 
                        ? 'ابدأ بجلسة جديدة ليتم حفظ نقاشاتك وأبحاثك هنا.' 
                        : 'Begin a new inquiry or research session to populate your scholarly history.'}
                </p>
            </div>
        )}
    </div>
  );
};
