
import type { LearnedContext, QAFeedback } from '../types';

/**
 * Service to handle Ultra Memory & Reinforcement Learning via Google Sheets.
 * 
 * SETUP:
 * 1. Deploy the Google Apps Script found in `backend/Code.gs`.
 * 2. Paste your Web App URL below.
 */

// REPLACE THIS WITH YOUR OWN GOOGLE APPS SCRIPT WEB APP URL
const SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwsa0CeAeQm43X5zD7xYCLi2r7NJlwnXaptz-gIgv9HTc-Io2Hu5-X6p2Be9WTjqv8q/exec'; 

export const logInteraction = async (
    question: string,
    answer: string | object,
    feedback: QAFeedback,
    category: string = 'QA'
): Promise<void> => {
    // If the user hasn't set up a backend, we just log to console.
    if (!SHEETS_ENDPOINT || SHEETS_ENDPOINT.includes('INSERT_YOUR_URL')) {
        console.log("[Mock Backend] Interaction logged:", { category, question, feedback });
        return;
    }

    try {
        const payload = {
            question,
            answer: typeof answer === 'object' ? JSON.stringify(answer, null, 2) : answer,
            score: feedback.score,
            correction: feedback.correction || '',
            category,
            timestamp: new Date().toISOString()
        };

        // Google Apps Script Web Apps allow POST requests but often have CORS issues with custom headers.
        // using 'no-cors' mode is the standard workaround for "fire-and-forget" logging.
        await fetch(SHEETS_ENDPOINT, {
            method: 'POST',
            mode: 'no-cors', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        console.log("Interaction logged to Ultra Memory.");
    } catch (e) {
        console.error("Failed to log to Google Sheets memory:", e);
    }
};

export const retrieveLearnedContext = async (topic: string): Promise<LearnedContext[]> => {
    // If the user hasn't set up a backend, return empty to fallback to AI generation
    if (!SHEETS_ENDPOINT || SHEETS_ENDPOINT.includes('INSERT_YOUR_URL')) {
        return [];
    }

    try {
        // GET requests to GAS Web Apps usually handle CORS correctly if "Anyone" access is set.
        const response = await fetch(`${SHEETS_ENDPOINT}?topic=${encodeURIComponent(topic)}`);
        
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Handle potential error response from backend
        if (data.error) {
            console.warn("Backend returned error:", data.error);
            return [];
        }

        return data as LearnedContext[];
    } catch (e) {
        // Fail silently so the app continues to work using just the AI model
        console.warn("Failed to retrieve memory (Offline or CORS issue):", e);
        return [];
    }
};
