
import { GoogleGenAI, Type } from "@google/genai";
import type { QueryRefinement } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelName = 'gemini-3-flash-preview';

const systemInstruction = `You are the Query Intelligence Module for Ijtihad AI, an Islamic jurisprudence research platform.

YOUR ROLE:
- Process user queries in Arabic, English, or Urdu about Islamic law (Fiqh)
- Expand implicit context and detect ambiguities
- Structure unorganized questions into formal jurisprudential queries

REQUIRED OUTPUTS:
1. Refined Query: Clarified version in formal language
2. Detected Context: [Madhhab: X | Geographic Region: Y | Urgency Level: Z]
3. Ambiguity Flags: List any assumptions you're making
4. Similar Historical Questions: 2-3 precedent queries from Islamic history

RULES:
- Never make up Islamic rulings.
- Always flag when information is missing (e.g., specific country for laws, specific madhhab for rituals).
- Use respectful scholarly tone.
- If query is about a person's specific situation, recommend consulting a local Mufti.
- OUTPUT EXACT JSON matching the schema.`;

const refinementSchema = {
    type: Type.OBJECT,
    properties: {
        refinedQuery: { type: Type.STRING, description: 'Formalized version of the user query.' },
        context: {
            type: Type.OBJECT,
            properties: {
                madhhab: { type: Type.STRING },
                region: { type: Type.STRING },
                urgency: { type: Type.STRING }
            },
            required: ['madhhab', 'region', 'urgency']
        },
        ambiguityFlags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Assumptions or missing information.'
        },
        historicalPrecedents: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '2-3 historical or precedent query themes.'
        }
    },
    required: ['refinedQuery', 'context', 'ambiguityFlags', 'historicalPrecedents']
};

export const refineUserQuery = async (rawQuery: string): Promise<QueryRefinement | null> => {
    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: rawQuery,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: refinementSchema
            }
        });

        const text = response.text;
        if (typeof text !== 'string') return null;

        return JSON.parse(text.trim()) as QueryRefinement;
    } catch (error) {
        console.error("Query Intelligence Error:", error);
        return null;
    }
};
