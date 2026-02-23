
import { GoogleGenAI, Type } from "@google/genai";
import type { ProofChain } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are the Citation Engine for Ijtihad AI. Your job is to trace the evidential basis for any Islamic ruling.

FOR EVERY RULING, PROVIDE:
1. Primary Sources (in order of authority):
   - Quranic verses (Surah:Ayah) with Arabic text + translation
   - Authentic Hadiths (with collection name, book, number, narrator chain summary, authenticity grade)
   - Ijma (scholarly consensus) - specify which era/scholars
   - Qiyas (analogical reasoning) - show the 4 components (Asl, Far, Illah, Hukm)

2. Secondary Sources:
   - Classical Fiqh texts (Ibn Rushd, Al-Mawardi, etc.) with volume:page
   - Modern fatawa from recognized bodies

3. Visual Metadata:
   - Assign confidence scores: 1 (Weak/disputed) to 3 (Strong consensus/Explicit).

CRITICAL RULES:
- NEVER cite a hadith without its collection + authenticity grade.
- If a ruling has weak evidence, explicitly say so.
- Show competing interpretations if they exist.
- OUTPUT EXACT JSON matching the provided schema.`;

const proofSchema = {
    type: Type.OBJECT,
    properties: {
        topic: { type: Type.STRING },
        nodes: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    sourceType: { type: Type.STRING, enum: ['quran', 'hadith', 'ijma', 'qiyas'] },
                    title: { type: Type.STRING },
                    content: { type: Type.STRING },
                    arabicText: { type: Type.STRING },
                    metadata: {
                        type: Type.OBJECT,
                        properties: {
                            reference: { type: Type.STRING },
                            authenticity: { type: Type.STRING },
                            narratorChain: { type: Type.STRING },
                            era: { type: Type.STRING },
                            confidence: { type: Type.NUMBER }
                        },
                        required: ['confidence']
                    }
                },
                required: ['id', 'sourceType', 'title', 'content', 'metadata']
            }
        },
        qiyasDetails: {
            type: Type.OBJECT,
            properties: {
                asl: { type: Type.STRING },
                far: { type: Type.STRING },
                illah: { type: Type.STRING },
                hukm: { type: Type.STRING }
            }
        },
        finalRuling: { type: Type.STRING },
        totalConfidence: { type: Type.NUMBER },
        scholarlyNote: { type: Type.STRING }
    },
    required: ['topic', 'nodes', 'finalRuling', 'totalConfidence', 'scholarlyNote']
};

function cleanJson(text: string | undefined | null): string {
    if (typeof text !== 'string') return "{}";
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    return cleaned;
}

export const generateProofChain = async (query: string): Promise<ProofChain | null> => {
    try {
        // Attempt 1: High-Reasoning Pro Model
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: `Trace the evidence chain for: "${query}"`,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: proofSchema,
                    // Reduced thinking budget to 1k to avoid RESOURCE_EXHAUSTED while still reasoning
                    thinkingConfig: { thinkingBudget: 1024 } 
                }
            });

            const text = response.text;
            if (typeof text === 'string' && text.trim().length > 0) {
                return JSON.parse(cleanJson(text)) as ProofChain;
            }
        } catch (err: any) {
            console.warn("Citation Engine Pro failed (likely quota/429), falling back to Flash.", err.message);
        }

        // Attempt 2: Fallback to Flash (Faster, Cheaper, No Thinking Budget)
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Trace the evidence chain for: "${query}"`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: proofSchema
            }
        });

        const text = response.text;
        if (typeof text !== 'string') {
            console.warn("Citation Engine returned undefined text even from fallback.");
            return null;
        }

        return JSON.parse(cleanJson(text)) as ProofChain;

    } catch (error) {
        console.error("Citation Engine Error:", error);
        return null;
    }
};
