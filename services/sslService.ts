
import type { SSLReport, ResearchData } from '../types';

/**
 * Sharia Safety Layer (SSL)
 * 
 * A client-side implementation of the SSL guardrail system.
 */

const NOVELTY_PATTERNS = [
    /I declare/i,
    /My fatwa/i,
    /I hereby rule/i,
    /new ruling/i,
    /my opinion is that/i,
    /I propose that/i
];

const PROHIBITED_TERMS = [
    /kill/i,
    /attack/i,
    /apostate/i,
    /kafir/i,
    /infidel/i,
    /murder/i
];

const CITATION_REGEX = /\[((?:Quran|Sahih al-Bukhari|Sahih Muslim|Sunan Abi Dawud|Jami` at-Tirmidhi|Sunan Ibn Majah|Fiqh Councils Statement|Al-Kasani|Ibn Qudamah|[^\]]+?)\s*[\d\s:,-]+)\]/g;

export const validateTextContent = (text: string): SSLReport => {
    const flags: string[] = [];
    let isSafe = true;

    // 1. Prohibited Content Check (Hard Block)
    const prohibitedMatches = PROHIBITED_TERMS.filter(pattern => pattern.test(text));
    if (prohibitedMatches.length > 0) {
        flags.push("Contains prohibited keywords (Hard Block)");
        isSafe = false; 
    }

    // 2. Novelty Detection (Warning Flag - Does not block Audit)
    const noveltyMatches = NOVELTY_PATTERNS.filter(pattern => pattern.test(text));
    if (noveltyMatches.length > 0) {
        flags.push("Potential unauthorized Ijtihad / Novelty detected");
        // We no longer set isSafe = false here, allowing the Consensus Audit 
        // to determine the validity/risk level.
    }

    // 3. Traceability (Source Verification)
    const matches = text.match(CITATION_REGEX);
    const citationCount = matches ? matches.length : 0;
    const traceabilityScore = Math.min(1, citationCount / (text.length / 500));

    if (text.length > 300 && citationCount === 0) {
        flags.push("Low Traceability: No direct classical citations found");
    }

    return {
        isSafe,
        flags,
        traceabilityScore,
        status: !isSafe ? 'ssl_flagged' : (flags.length > 0 ? 'admin_review' : 'published')
    };
};

export const validateResearchData = (data: ResearchData): SSLReport => {
    const flags: string[] = [];
    let isSafe = true;
    let totalSources = 0;

    const quran = data.quranicVerses || [];
    const hadith = data.hadith || [];
    const fiqh = data.classicalFiqh || [];

    if (quran.length === 0 && hadith.length === 0 && fiqh.length === 0) {
        flags.push("Insufficient Sources: No primary texts provided");
    }

    totalSources += quran.length;
    totalSources += hadith.length;
    totalSources += fiqh.length;

    const combinedText = [
        ...hadith.map(h => h.text),
        ...fiqh.map(f => f.text)
    ].join(" ");

    const textValidation = validateTextContent(combinedText);
    
    if (!textValidation.isSafe) {
        isSafe = false;
        flags.push(...textValidation.flags);
    }

    return {
        isSafe,
        flags: isSafe ? textValidation.flags : flags,
        traceabilityScore: totalSources > 0 ? 1 : 0,
        status: isSafe ? (textValidation.flags.length > 0 ? 'admin_review' : 'published') : 'ssl_flagged'
    };
};
