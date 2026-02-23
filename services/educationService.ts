
import type { EducationModule, UserProfile, EducationBadge } from '../types';

const PROFILE_KEY = 'ijtihad_student_profile';

const LEVEL_TITLES = {
    1: "The Seeker",
    2: "The Investigator",
    3: "The Reasoner",
    4: "The Scholar",
    5: "The Jurist",
    6: "The Mufti-in-Training",
    7: "The Mujtahid"
};

const DEFAULT_CURRICULUM: EducationModule[] = [
    // LEVEL 1: FOUNDATION
    {
        id: 'm1.1',
        title: 'Islamic Legal Categories',
        levelId: 1,
        levelTitle: LEVEL_TITLES[1],
        description: 'Understand the Five Rulings (Ahkam) that govern all actions.',
        isCompleted: false,
        isLocked: false,
        lessons: [
            { id: 'l1.1.1', title: 'The Five Rulings (Ahkam)', type: 'text', description: 'Fard, Wajib, Mustahabb, Mubah, Makruh, Haram.', durationMinutes: 20, isCompleted: false, isLocked: false, xpReward: 50 },
            { id: 'l1.1.2', title: 'Action Categorizer', type: 'interactive_matching', description: 'Categorize 10 daily actions into the correct ruling.', durationMinutes: 15, isCompleted: false, isLocked: true, xpReward: 75 },
        ]
    },
    {
        id: 'm1.2',
        title: 'Why Do Muslims Disagree?',
        levelId: 1,
        levelTitle: LEVEL_TITLES[1],
        description: 'Introduction to legitimate Ikhtilaf and the Madhhabs.',
        isCompleted: false,
        isLocked: true,
        lessons: [
            { id: 'l1.2.1', title: 'Birth of the Madhhabs', type: 'text', description: 'History of the four schools and their founders.', durationMinutes: 20, isCompleted: false, isLocked: true, xpReward: 50 },
            { id: 'l1.2.2', title: 'Same Sources, Different Views', type: 'video', description: 'Case study: Wudu rules across schools.', durationMinutes: 10, isCompleted: false, isLocked: true, xpReward: 50 },
        ]
    },
    // LEVEL 2: SOURCES
    {
        id: 'm2.1',
        title: 'The Quran as Legal Source',
        levelId: 2,
        levelTitle: LEVEL_TITLES[2],
        description: 'Deep dive into Ayat al-Ahkam (Verses of Rulings).',
        isCompleted: false,
        isLocked: true,
        lessons: [
            { id: 'l2.1.1', title: 'Muhkam vs Mutashabih', type: 'text', description: 'Clear vs Ambiguous verses.', durationMinutes: 30, isCompleted: false, isLocked: true, xpReward: 100 },
            { id: 'l2.1.2', title: 'Inheritance Math', type: 'interactive_grading', description: 'Calculate shares based on Surah An-Nisa.', durationMinutes: 25, isCompleted: false, isLocked: true, xpReward: 150 },
        ]
    },
    {
        id: 'm2.2',
        title: 'Hadith Sciences Fundamentals',
        levelId: 2,
        levelTitle: LEVEL_TITLES[2],
        description: 'Authentication methodology (Isnad + Matn criticism).',
        isCompleted: false,
        isLocked: true,
        lessons: [
            { id: 'l2.2.1', title: 'Anatomy of a Hadith', type: 'text', description: 'Understanding Sanad and Matn.', durationMinutes: 20, isCompleted: false, isLocked: true, xpReward: 100 },
            { id: 'l2.2.2', title: 'Hadith Detective', type: 'interactive_grading', description: 'Grade 5 hadiths based on narrator biographies.', durationMinutes: 30, isCompleted: false, isLocked: true, xpReward: 200 },
        ]
    },
    // LEVEL 3: REASONING
    {
        id: 'm3.1',
        title: 'The Art of Qiyas',
        levelId: 3,
        levelTitle: LEVEL_TITLES[3],
        description: 'Mastering Analogical Reasoning.',
        isCompleted: false,
        isLocked: true,
        lessons: [
            { id: 'l3.1.1', title: 'The Four Pillars', type: 'text', description: 'Asl, Far, Illah, Hukm explained.', durationMinutes: 30, isCompleted: false, isLocked: true, xpReward: 150 },
            { id: 'l3.1.2', title: 'Find the Flaw', type: 'interactive_grading', description: 'Identify invalid analogies.', durationMinutes: 25, isCompleted: false, isLocked: true, xpReward: 150 },
        ]
    },
    {
        id: 'm3.3',
        title: 'Legal Maxims',
        levelId: 3,
        levelTitle: LEVEL_TITLES[3],
        description: 'The Five Great Maxims (Al-Qawa\'id al-Khams).',
        isCompleted: false,
        isLocked: true,
        lessons: [
            { id: 'l3.3.1', title: 'Matters by Intentions', type: 'text', description: 'Applying "Al-Umur bi-Maqasidiha".', durationMinutes: 25, isCompleted: false, isLocked: true, xpReward: 100 },
            { id: 'l3.3.2', title: 'Maxim Matcher', type: 'interactive_matching', description: 'Match scenarios to the correct Maxim.', durationMinutes: 20, isCompleted: false, isLocked: true, xpReward: 150 },
        ]
    },
    // LEVEL 7: CAPSTONE (Abbreviated)
    {
        id: 'm7.1',
        title: 'The Mujtahid Capstone',
        levelId: 7,
        levelTitle: LEVEL_TITLES[7],
        description: 'Produce original scholarship.',
        isCompleted: false,
        isLocked: true,
        lessons: [
            { id: 'l7.1.1', title: 'Draft Original Fatwa', type: 'capstone', description: 'Research and write a legal opinion on a novel issue.', durationMinutes: 120, isCompleted: false, isLocked: true, xpReward: 1000 },
        ]
    }
];

export const getStudentProfile = (): UserProfile | null => {
    try {
        const stored = localStorage.getItem(PROFILE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) { console.error(e); }
    return null;
};

export const createStudentProfile = (data: Partial<UserProfile>): UserProfile => {
    const newProfile: UserProfile = {
        name: data.name || 'Student',
        currentTitle: LEVEL_TITLES[1],
        level: 1,
        xp: 0,
        streakDays: 1,
        goals: data.goals || [],
        timeCommitment: data.timeCommitment || 'Casual',
        learningStyle: data.learningStyle || 'textual',
        madhhabPreference: data.madhhabPreference || 'Comparative',
        completedLessonIds: [],
        completedModuleIds: [],
        earnedBadges: []
    };
    saveProfile(newProfile);
    return newProfile;
};

export const saveProfile = (profile: UserProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const getCurriculum = (): EducationModule[] => {
    const profile = getStudentProfile();
    if (!profile) return DEFAULT_CURRICULUM;

    // Unlock logic based on profile progress
    return DEFAULT_CURRICULUM.map((module, mIndex) => {
        // Module is locked if:
        // 1. It's not the first module AND previous module is not complete
        // 2. The module level is higher than user level (though user level updates automatically)
        const prevModuleId = mIndex > 0 ? DEFAULT_CURRICULUM[mIndex-1].id : null;
        const isPrevDone = prevModuleId ? profile.completedModuleIds.includes(prevModuleId) : true;
        
        const modLocked = !isPrevDone;
        
        return {
            ...module,
            isCompleted: profile.completedModuleIds.includes(module.id),
            isLocked: modLocked,
            lessons: module.lessons.map((lesson, lIndex) => {
                const prevLessonId = lIndex > 0 ? module.lessons[lIndex-1].id : null;
                const lessonLocked = modLocked || (prevLessonId ? !profile.completedLessonIds.includes(prevLessonId) : false);
                
                return {
                    ...lesson,
                    isCompleted: profile.completedLessonIds.includes(lesson.id),
                    isLocked: lessonLocked
                };
            })
        };
    });
};

export const completeLesson = (lessonId: string) => {
    const profile = getStudentProfile();
    if (!profile) return;

    if (!profile.completedLessonIds.includes(lessonId)) {
        profile.completedLessonIds.push(lessonId);
        
        // Find XP reward
        let lessonXP = 0;
        let moduleId = '';
        let moduleLevel = 1;

        DEFAULT_CURRICULUM.forEach(m => {
            const l = m.lessons.find(lx => lx.id === lessonId);
            if (l) {
                lessonXP = l.xpReward;
                moduleId = m.id;
                moduleLevel = m.levelId;
            }
        });

        profile.xp += lessonXP;

        // Check Module Completion
        if (moduleId) {
            const module = DEFAULT_CURRICULUM.find(m => m.id === moduleId);
            if (module) {
                const allLessonsDone = module.lessons.every(l => profile.completedLessonIds.includes(l.id));
                if (allLessonsDone && !profile.completedModuleIds.includes(moduleId)) {
                    profile.completedModuleIds.push(moduleId);
                    profile.xp += 200; // Bonus for module completion
                    
                    // Level Up Logic?
                    const nextModule = DEFAULT_CURRICULUM.find(m => m.levelId > moduleLevel);
                    if (!nextModule || moduleLevel > profile.level) {
                        // Check if all modules of this level are done
                        const modulesOfLevel = DEFAULT_CURRICULUM.filter(m => m.levelId === moduleLevel);
                        const allLevelModulesDone = modulesOfLevel.every(m => profile.completedModuleIds.includes(m.id));
                        
                        if (allLevelModulesDone && profile.level < 7) {
                            profile.level += 1;
                            profile.currentTitle = LEVEL_TITLES[profile.level as keyof typeof LEVEL_TITLES];
                            profile.earnedBadges.push({
                                id: `lvl-${profile.level}`,
                                title: profile.currentTitle,
                                icon: 'TrophyIcon',
                                description: `Advanced to Level ${profile.level}`,
                                earnedDate: Date.now()
                            });
                        }
                    }
                }
            }
        }
        saveProfile(profile);
    }
};
