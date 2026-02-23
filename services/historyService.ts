
import type { History, QASession, ResearchTopic, ScholarProfile, PersonalNote, WorkspaceAlert } from '../types';

const HISTORY_KEY = 'ijtihad_ai_history';
const PROFILE_KEY = 'ijtihad_mufti_profile';
const NOTES_KEY = 'ijtihad_mufti_notes';
const ALERTS_KEY = 'ijtihad_mufti_alerts';

const getInitialHistory = (): History => ({
  qa: [],
  research: [],
});

export const getHistory = (): History => {
  try {
    const storedHistory = localStorage.getItem(HISTORY_KEY);
    if (storedHistory) {
      const parsed = JSON.parse(storedHistory);
      return {
        qa: Array.isArray(parsed.qa) ? parsed.qa : [],
        research: Array.isArray(parsed.research) ? parsed.research : [],
      };
    }
  } catch (error) {
    console.error("Failed to parse history from localStorage", error);
  }
  return getInitialHistory();
};

const saveHistory = (history: History) => {
  try {
    // Keep history lists to a reasonable size to avoid filling up localStorage
    const cappedHistory: History = {
        qa: (history.qa || []).slice(0, 50),
        research: (history.research || []).slice(0, 50),
    };
    localStorage.setItem(HISTORY_KEY, JSON.stringify(cappedHistory));
  } catch (error) {
    console.error("Failed to save history to localStorage", error);
  }
};

export const addQASession = (session: QASession) => {
  const history = getHistory();
  // Avoid duplicate questions by filtering them out, then add new one with timestamp
  const newSessionWithTime = { ...session, timestamp: Date.now() };
  const newQaHistory = [newSessionWithTime, ...history.qa.filter(s => s.question !== session.question)];
  saveHistory({ ...history, qa: newQaHistory });
};

export const addResearchTopic = (topic: ResearchTopic) => {
  const history = getHistory();
  // Avoid duplicate topics
  const newTopicWithTime = { ...topic, timestamp: Date.now() };
  const newResearchHistory = [newTopicWithTime, ...history.research.filter(t => t.topic !== topic.topic)];
  saveHistory({ ...history, research: newResearchHistory });
};

export const clearHistory = (): History => {
  const initialHistory = getInitialHistory();
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(initialHistory));
  } catch (error) {
    console.error("Failed to clear history in localStorage", error);
  }
  return initialHistory;
};

// --- Mufti Workspace Methods ---

export const getScholarProfile = (): ScholarProfile => {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) return JSON.parse(stored);
    return {
        name: 'Respected Mufti',
        madhhab: 'Hanafi',
        usulStrictness: 0.5,
        bio: 'Scholar of Islamic Jurisprudence'
    };
};

export const saveScholarProfile = (profile: ScholarProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const getPersonalNotes = (): PersonalNote[] => {
    const stored = localStorage.getItem(NOTES_KEY);
    if (stored) return JSON.parse(stored);
    return [];
};

export const savePersonalNote = (note: PersonalNote) => {
    const notes = getPersonalNotes();
    const existingIndex = notes.findIndex(n => n.id === note.id);
    if (existingIndex > -1) {
        notes[existingIndex] = note;
    } else {
        notes.unshift(note);
    }
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
};

export const deletePersonalNote = (id: string) => {
    const notes = getPersonalNotes().filter(n => n.id !== id);
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
};

export const getWorkspaceAlerts = (): WorkspaceAlert[] => {
    const stored = localStorage.getItem(ALERTS_KEY);
    if (stored) return JSON.parse(stored);
    return [];
};

export const addWorkspaceAlert = (alert: WorkspaceAlert) => {
    const alerts = getWorkspaceAlerts();
    alerts.unshift(alert);
    // limit to 20 alerts
    if (alerts.length > 20) alerts.pop();
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
};
