
import React, { useState, useEffect } from 'react';
import { 
    IslamicStarIcon, NetworkIcon, ScaleIcon, BookOpenIcon, 
    GavelIcon, MicIcon, HistoryIcon, 
    UserIcon, GraduationCapIcon, ScrollIcon, 
    DatabaseIcon, GitBranchIcon, ShieldCheckIcon, CoinsIcon,
    BriefcaseIcon, LightbulbIcon, GlobeIcon, GitMergeIcon,
    BeakerIcon, PanelLeftIcon
} from './components/icons';

import { QuestionAnsweringPanel } from './components/QuestionAnsweringPanel';
import { ResearchAidPanel } from './components/ResearchAidPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { LiveVoicePanel } from './components/LiveVoicePanel';
import { AdminDashboard } from './components/AdminDashboard';
import { LabPanel } from './components/LabPanel';
import { IkhtilafVisualizer } from './components/IkhtilafVisualizer';
import { DebateSimulationPanel } from './components/DebateSimulationPanel';
import { DualCompliancePanel } from './components/DualCompliancePanel';
import { PrecedentPanel } from './components/PrecedentPanel';
import { FinanceStructuringPanel } from './components/FinanceStructuringPanel';
import { MuftiWorkspace } from './components/MuftiWorkspace';
import { EvidenceChainPanel } from './components/EvidenceChainPanel';
import { QiyasBuilderPanel } from './components/QiyasBuilderPanel';
import { GlobalMajlisPanel } from './components/GlobalMajlisPanel';
import { EducationPanel } from './components/EducationPanel';
import { ManuscriptPanel } from './components/ManuscriptPanel';
import { HadithMemorizationPanel } from './components/HadithMemorizationPanel';
import { ComputationalFiqhPanel } from './components/ComputationalFiqhPanel';

import { getHistory, clearHistory } from './services/historyService';
import type { History, QASession } from './types';

type View = 'qa' | 'research' | 'debate' | 'workspace' | 'history' | 'majlis' | 'education' | 'srs' | 'voice' | 'lab' | 'visualizer' | 'admin' | 'compliance' | 'precedent' | 'finance' | 'manuscript' | 'computational' | 'qiyas' | 'citation';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('qa');
  const [history, setHistory] = useState<History>({ qa: [], research: [] });
  const [selectedSession, setSelectedSession] = useState<QASession | null>(null);
  const [selectedResearchTopic, setSelectedResearchTopic] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'ar' | 'ur'>('en');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleRefreshHistory = () => {
    setHistory(getHistory());
  };

  const handleClearHistory = () => {
    setHistory(clearHistory());
  };

  const handleSelectQA = (session: QASession) => {
    setSelectedSession(session);
    setActiveView('qa');
  };

  const handleSelectResearch = (topic: string) => {
    setSelectedResearchTopic(topic);
    setActiveView('research');
  };

  const handleCitationClick = (citation: string) => {
      // In a full app, this would open a citation viewer sidebar/modal
      console.log("Viewing citation:", citation);
  };

  const menuItems = [
      { id: 'qa', label: 'AI Mufti', icon: IslamicStarIcon, category: 'Core' },
      { id: 'research', label: 'Deep Research', icon: NetworkIcon, category: 'Core' },
      { id: 'voice', label: 'Voice Mode', icon: MicIcon, category: 'Core' },
      
      { id: 'citation', label: 'Citation Engine', icon: ScaleIcon, category: 'Tools' },
      { id: 'qiyas', label: 'Qiyas Builder', icon: GitMergeIcon, category: 'Tools' },
      { id: 'visualizer', label: 'Ikhtilaf Map', icon: GitBranchIcon, category: 'Tools' },
      { id: 'compliance', label: 'Dual Compliance', icon: ShieldCheckIcon, category: 'Tools' },
      { id: 'finance', label: 'Finance Structuring', icon: CoinsIcon, category: 'Tools' },
      { id: 'precedent', label: 'Precedent Explorer', icon: BriefcaseIcon, category: 'Tools' },
      { id: 'lab', label: 'Ijtihad Lab', icon: BeakerIcon, category: 'Tools' },
      { id: 'computational', label: 'Computational Fiqh', icon: LightbulbIcon, category: 'Tools' },
      
      { id: 'majlis', label: 'Global Majlis', icon: GlobeIcon, category: 'Community' },
      { id: 'workspace', label: 'Mufti Workspace', icon: UserIcon, category: 'Personal' },
      { id: 'education', label: 'Academy', icon: GraduationCapIcon, category: 'Personal' },
      { id: 'srs', label: 'Hifz Coach', icon: BookOpenIcon, category: 'Personal' },
      { id: 'manuscript', label: 'Manuscripts', icon: ScrollIcon, category: 'Resources' },
      { id: 'history', label: 'Archives', icon: HistoryIcon, category: 'System' },
      { id: 'admin', label: 'Admin', icon: DatabaseIcon, category: 'System' },
  ];

  const getPageTitle = () => {
      const item = menuItems.find(i => i.id === activeView);
      return item ? item.label : 'Ijtihad AI';
  };

  const categories = Array.from(new Set(menuItems.map(i => i.category)));

  return (
    <div className={`flex h-screen bg-[var(--bg-deep)] text-[var(--text-primary)] font-sans overflow-hidden ${language === 'ar' || language === 'ur' ? 'rtl' : 'ltr'}`} dir={language === 'ar' || language === 'ur' ? 'rtl' : 'ltr'}>
      
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0 bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex flex-col transition-all duration-300 z-20`}>
          <div className="p-6 flex items-center justify-between">
              {isSidebarOpen ? (
                  <h1 className="text-xl font-display font-bold tracking-wide text-white">
                      IJTIHAD <span className="text-[var(--accent-gold)]">AI</span>
                  </h1>
              ) : (
                  <IslamicStarIcon className="w-8 h-8 text-[var(--accent-gold)] mx-auto" />
              )}
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-500 hover:text-white hidden lg:block">
                  <PanelLeftIcon className="w-5 h-5" />
              </button>
          </div>
          
          <div className="flex-grow overflow-y-auto px-3 space-y-6 custom-scrollbar">
              {categories.map(cat => (
                  <div key={cat}>
                      {isSidebarOpen && <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{cat}</h3>}
                      <div className="space-y-1">
                          {menuItems.filter(i => i.category === cat).map(item => (
                              <button 
                                key={item.id}
                                onClick={() => setActiveView(item.id as View)}
                                className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 group relative ${activeView === item.id ? 'bg-[var(--accent-gold)] text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                                title={!isSidebarOpen ? item.label : ''}
                              >
                                  <item.icon className={`w-5 h-5 flex-shrink-0 ${activeView === item.id ? 'text-black' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                  {isSidebarOpen && <span className="text-sm truncate">{item.label}</span>}
                                  {!isSidebarOpen && activeView === item.id && <div className="absolute right-1 w-1.5 h-1.5 rounded-full bg-black"></div>}
                              </button>
                          ))}
                      </div>
                  </div>
              ))}
          </div>

          <div className="p-4 border-t border-[var(--border-subtle)]">
              {isSidebarOpen ? (
                  <div className="flex bg-[#121212] rounded-lg p-1 border border-[var(--border-subtle)]">
                      {(['en', 'ar', 'ur'] as const).map((lang) => (
                          <button
                              key={lang}
                              onClick={() => setLanguage(lang)}
                              className={`flex-1 text-[10px] font-bold py-1.5 rounded-md uppercase transition-colors ${language === lang ? 'bg-[var(--accent-gold)] text-black' : 'text-slate-500 hover:text-slate-300'}`}
                          >
                              {lang}
                          </button>
                      ))}
                  </div>
              ) : (
                  <button onClick={() => setLanguage(l => l === 'en' ? 'ar' : l === 'ar' ? 'ur' : 'en')} className="w-full text-xs font-bold text-slate-500 uppercase text-center">
                      {language}
                  </button>
              )}
          </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
            <header className="h-16 border-b border-[var(--border-subtle)] flex items-center justify-between px-8 bg-[var(--bg-deep)]/80 backdrop-blur-md z-10">
                <h2 className="text-lg font-display font-bold text-slate-200 flex items-center gap-3">
                    {menuItems.find(i => i.id === activeView)?.icon && React.createElement(menuItems.find(i => i.id === activeView)!.icon, { className: "w-5 h-5 text-[var(--accent-gold)]" })}
                    {getPageTitle()}
                </h2>
                <div className="flex items-center gap-4">
                    <div className="px-3 py-1 rounded-full bg-green-900/20 border border-green-500/20 text-[10px] font-bold text-green-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        ONLINE
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
                
                <div className="h-full overflow-y-auto custom-scrollbar">
                    {activeView === 'qa' && (
                        <QuestionAnsweringPanel 
                            language={language}
                            onCitationClick={handleCitationClick}
                            onHistoryUpdate={handleRefreshHistory}
                            initialSession={selectedSession}
                            onSessionLoaded={() => setSelectedSession(null)}
                        />
                    )}
                    {activeView === 'research' && (
                        <ResearchAidPanel 
                            language={language}
                            onCitationClick={handleCitationClick}
                            onHistoryUpdate={handleRefreshHistory}
                            initialTopic={selectedResearchTopic}
                            onTopicSearched={() => setSelectedResearchTopic(null)}
                        />
                    )}
                    {activeView === 'voice' && <LiveVoicePanel language={language} />}
                    {activeView === 'history' && (
                        <div className="p-8">
                            <HistoryPanel 
                                history={history}
                                onSelectQA={handleSelectQA}
                                onSelectResearch={handleSelectResearch}
                                onClearHistory={handleClearHistory}
                                language={language}
                            />
                        </div>
                    )}
                    {activeView === 'admin' && <div className="p-8"><AdminDashboard language={language} /></div>}
                    {activeView === 'lab' && <div className="p-8"><LabPanel language={language} /></div>}
                    {activeView === 'visualizer' && <div className="p-8"><IkhtilafVisualizer language={language} /></div>}
                    {activeView === 'debate' && <div className="p-8"><DebateSimulationPanel language={language} /></div>}
                    {activeView === 'compliance' && <div className="p-8"><DualCompliancePanel language={language} /></div>}
                    {activeView === 'precedent' && <div className="p-8"><PrecedentPanel language={language} /></div>}
                    {activeView === 'finance' && <div className="p-8"><FinanceStructuringPanel language={language} /></div>}
                    {activeView === 'workspace' && <div className="p-8"><MuftiWorkspace language={language} /></div>}
                    {activeView === 'citation' && <div className="p-8"><EvidenceChainPanel language={language} /></div>}
                    {activeView === 'qiyas' && <div className="p-8"><QiyasBuilderPanel language={language} /></div>}
                    {activeView === 'majlis' && <div className="p-8"><GlobalMajlisPanel language={language} /></div>}
                    {activeView === 'education' && <div className="p-8"><EducationPanel language={language} /></div>}
                    {activeView === 'manuscript' && <div className="p-8"><ManuscriptPanel language={language} /></div>}
                    {activeView === 'srs' && <div className="p-8"><HadithMemorizationPanel language={language} /></div>}
                    {activeView === 'computational' && <div className="p-8"><ComputationalFiqhPanel language={language} /></div>}
                </div>
            </main>
      </div>
    </div>
  );
};

export default App;
