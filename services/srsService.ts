
import type { HadithCard, HadithDeck, SRSStatus } from '../types';

const STORAGE_KEY = 'ijtihad_srs_data';

// Initial Mock Data: 40 Nawawi
const INITIAL_DECKS: HadithDeck[] = [
    {
        id: 'nawawi40',
        title: 'The 40 Hadith of Imam Nawawi',
        description: 'The foundational traditions that encompass the core principles of Islam.',
        totalCards: 42,
        masteredCards: 0,
        coverImage: 'bg-emerald-900'
    },
    {
        id: 'daily_life',
        title: 'Daily Life Rulings',
        description: 'Essential hadiths for Wudu, Salah, and daily etiquette.',
        totalCards: 20,
        masteredCards: 0,
        coverImage: 'bg-blue-900'
    }
];

const INITIAL_CARDS: HadithCard[] = [
    {
        id: 'nawawi-1',
        deckId: 'nawawi40',
        title: 'Hadith 1: Actions & Intentions',
        arabicText: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا، فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ',
        englishText: 'Actions are judged by intentions, so each man will have what he intended. Thus, he whose migration was to Allah and His Messenger, his migration is to Allah and His Messenger; but he whose migration was for some worldly thing he might gain, or for a wife he might marry, his migration is to that for which he migrated.',
        narrator: 'Umar ibn al-Khattab (RA)',
        reference: 'Sahih Bukhari (1) & Muslim (1907)',
        topics: ['Niyyah', 'Sincerity', 'Hijrah'],
        srs: { box: 0, interval: 0, dueDate: Date.now(), lastReviewed: 0, easeFactor: 2.5 }
    },
    {
        id: 'nawawi-2',
        deckId: 'nawawi40',
        title: 'Hadith 2: Jibril & The Deen',
        arabicText: '...قَالَ: فَأَخْبِرْنِي عَنِ الإِسْلاَمِ. قَالَ: الإِسْلاَمُ أَنْ تَشْهَدَ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَتُقِيمَ الصَّلاَةَ، وَتُؤْتِيَ الزَّكَاةَ، وَتَصُومَ رَمَضَانَ، وَتَحُجَّ الْبَيْتَ إِنِ اسْتَطَعْتَ إِلَيْهِ سَبِيلاً...',
        englishText: '...He said: Tell me about Islam. The Messenger of Allah ﷺ said: Islam is to testify that there is no god but Allah and that Muhammad is the Messenger of Allah, to establish prayer, to pay zakat, to fast Ramadan, and to make pilgrimage to the House if you are able to do so...',
        narrator: 'Umar ibn al-Khattab (RA)',
        reference: 'Sahih Muslim (8)',
        topics: ['Iman', 'Islam', 'Ihsan'],
        srs: { box: 0, interval: 0, dueDate: Date.now(), lastReviewed: 0, easeFactor: 2.5 }
    }
];

export const getDecks = (): HadithDeck[] => {
    // In a real app, calculate 'masteredCards' dynamically from card data
    return INITIAL_DECKS;
};

export const getDueCards = (deckId: string): HadithCard[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    let allCards = stored ? JSON.parse(stored) : INITIAL_CARDS;
    
    // Filter for deck and due date <= now
    const now = Date.now();
    const due = allCards.filter((c: HadithCard) => c.deckId === deckId && c.srs.dueDate <= now);
    
    // If no data in local storage yet, return initial cards for that deck
    if (!stored && due.length === 0) {
        return INITIAL_CARDS.filter(c => c.deckId === deckId);
    }
    
    return due;
};

export const getNextCard = (deckId: string): HadithCard | null => {
    const due = getDueCards(deckId);
    return due.length > 0 ? due[0] : null;
};

export const processReview = (cardId: string, rating: 'again' | 'hard' | 'good' | 'easy'): void => {
    const stored = localStorage.getItem(STORAGE_KEY);
    let allCards: HadithCard[] = stored ? JSON.parse(stored) : INITIAL_CARDS;
    
    const index = allCards.findIndex(c => c.id === cardId);
    if (index === -1) return;

    const card = allCards[index];
    const { srs } = card;

    // Leitner-ish Logic adjusted for the prompt (1, 3, 7, 14, 30 days)
    const intervals = [1, 3, 7, 14, 30]; // Index corresponds to Box 1-5

    let newBox = srs.box;
    let nextInterval = 1; // Default to 1 day

    if (rating === 'again') {
        newBox = 1; // Reset to Box 1
        nextInterval = 1; // 1 day
    } else if (rating === 'hard') {
        newBox = Math.max(1, srs.box); // Stay in current box or at least box 1
        nextInterval = intervals[Math.min(newBox - 1, intervals.length - 1)]; // Current interval
    } else if (rating === 'good') {
        newBox = Math.min(5, srs.box + 1); // Move up
        nextInterval = intervals[Math.min(newBox - 1, intervals.length - 1)];
    } else if (rating === 'easy') {
        newBox = Math.min(5, srs.box + 2); // Jump up
        nextInterval = intervals[Math.min(newBox - 1, intervals.length - 1)];
    }

    // Update Card
    card.srs = {
        box: newBox,
        interval: nextInterval,
        dueDate: Date.now() + (nextInterval * 24 * 60 * 60 * 1000),
        lastReviewed: Date.now(),
        easeFactor: srs.easeFactor // Unchanged in this simplified version
    };

    allCards[index] = card;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allCards));
};

export const getStats = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const allCards: HadithCard[] = stored ? JSON.parse(stored) : INITIAL_CARDS;
    
    return {
        totalCards: allCards.length,
        dueToday: allCards.filter(c => c.srs.dueDate <= Date.now()).length,
        mastered: allCards.filter(c => c.srs.box >= 5).length,
        streak: 3 // Mock streak for now
    };
};
