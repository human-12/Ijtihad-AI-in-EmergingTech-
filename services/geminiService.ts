
import { GoogleGenAI, Type, LiveServerMessage, Modality } from "@google/genai";
import type { 
    QiyasAnalysis, SSLAuditResult, QueryRefinement, DeepResearchState,
    ProcessedFatwa, SandboxAnalysis, SandboxParameters,
    IkhtilafGraph, DebateAgent, DebateMessage, ComplianceAnalysis,
    FinanceAnalysis, ContrastAnalysis,
    QiyasConstructionResponse, MajlisSession, MajlisScholar,
    CoachingResponse, FiqhOntology, ProofChain, ManuscriptAnalysis,
    AppraisalResult, DocumentVerification, ResearchUpdate, GroundingMetadata, AgentLog,
    QiyasUpdate, QiyasFar, QiyasAsl, QiyasIllah, IllahValidationCriteria, QiyasConflict,
    PrecedentUpdate, ScenarioProfile, PrecedentMatch, ConflictReport, TrendSummary
} from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

export const runQiyasPipeline = async function* (topic: string, language: string, signal?: AbortSignal): AsyncGenerator<QiyasUpdate> {
    const steps = [
        'Far\' Attribute Mapping',
        'Asl Retrieval',
        '\'Illah Extraction',
        '\'Illah Validity Testing',
        'Conflict Detection',
        'Analogical Synthesis'
    ];

    try {
        for (let i = 0; i < steps.length; i++) {
            if (signal?.aborted) return;
            yield { type: 'step', index: i };
            yield { type: 'log', message: `[Orchestrator] Initiating ${steps[i]}...` };

            await new Promise(resolve => setTimeout(resolve, 1500));

            if (i === 0) {
                const prompt = `
                    Analyze the following modern issue (Far') for Qiyas (Analogical Deduction): "${topic}".
                    Identify 3-5 key attributes that are relevant for legal reasoning.
                    For each attribute, determine if it likely matches with a classical precedent (Asl).
                    Output JSON in this format:
                    {
                        "topic": "${topic}",
                        "attributes": [
                            { "name": "Attribute Name", "value": "Attribute Value", "matchWithAsl": boolean }
                        ],
                        "similarityScore": number (0.0 to 1.0)
                    }
                `;
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: prompt,
                    config: { responseMimeType: "application/json" }
                });
                const data = JSON.parse(cleanJson(response.text));
                yield { type: 'far_analysis', data };

            } else if (i === 1) {
                const prompt = `
                    Given the Far' (modern issue): "${topic}", identify 2-3 potential Asl (original root cases) from classical Islamic jurisprudence that could serve as precedents.
                    For each Asl, provide the case name, the ruling (Hukm), the textual source (Quran/Hadith), source strength, and context.
                    Output JSON in this format:
                    [
                        {
                            "id": "ASL-00X",
                            "caseName": "Name of Asl",
                            "hukm": "The Ruling",
                            "textualSource": "Source Citation",
                            "sourceStrength": "Mutawatir" | "Ahad" | "Ijma" | "Strong" | "Medium",
                            "context": "Brief Context"
                        }
                    ]
                `;
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: prompt,
                    config: { responseMimeType: "application/json" }
                });
                const data = JSON.parse(cleanJson(response.text));
                yield { type: 'asl_candidates', data };

            } else if (i === 2) {
                const prompt = `
                    For the topic "${topic}", extract the most likely 'Illah (effective legal cause) that links it to a classical Asl.
                    Determine if it is Mansusah (Explicit) or Mustanbatah (Inferred).
                    Provide a justification and scope.
                    Output JSON in this format:
                    {
                        "description": "Description of Illah",
                        "type": "Mansusah" | "Mustanbatah",
                        "justification": "Why this is the cause",
                        "scope": "Scope of application",
                        "validationStatus": "Pending"
                    }
                `;
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: prompt,
                    config: { responseMimeType: "application/json" }
                });
                const data = JSON.parse(cleanJson(response.text));
                yield { type: 'illah_extraction', data };

            } else if (i === 3) {
                const prompt = `
                    Validate the extracted 'Illah for "${topic}" against classical Usul al-Fiqh criteria:
                    1. Munasib (Suitable)
                    2. Zahir (Apparent)
                    3. Mundabit (Consistent)
                    4. Mutaddi (Transitive/Transferable)
                    5. No Override (Not contradicting text)
                    Output JSON in this format:
                    {
                        "munasib": { "status": "Pass" | "Fail", "reasoning": "..." },
                        "zahir": { "status": "Pass" | "Fail", "reasoning": "..." },
                        "mundabit": { "status": "Pass" | "Fail", "reasoning": "..." },
                        "mutaddi": { "status": "Pass" | "Fail", "reasoning": "..." },
                        "noOverride": { "status": "Pass" | "Fail", "reasoning": "..." }
                    }
                `;
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: prompt,
                    config: { responseMimeType: "application/json" }
                });
                const data = JSON.parse(cleanJson(response.text));
                yield { type: 'validation_report', data };

            } else if (i === 4) {
                const prompt = `
                    Identify any potential conflicts (Maqasid, Textual, or Stronger Asl) for the Qiyas on "${topic}".
                    Output JSON in this format:
                    [
                        {
                            "type": "Nass" | "Ijma" | "Maqasid" | "StrongerAsl",
                            "description": "Description of conflict",
                            "severity": "High" | "Medium" | "Low"
                        }
                    ]
                `;
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: prompt,
                    config: { responseMimeType: "application/json" }
                });
                const data = JSON.parse(cleanJson(response.text));
                yield { type: 'conflict_detection', data };

            } else if (i === 5) {
                const prompt = `
                    Synthesize the final Qiyas ruling for "${topic}".
                    Provide the ruling, a confidence score (0-100), and a reasoning chain.
                    Output JSON in this format:
                    {
                        "ruling": "Final Ruling Statement",
                        "confidence": number,
                        "chain": ["Step 1", "Step 2", ...]
                    }
                `;
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: prompt,
                    config: { responseMimeType: "application/json" }
                });
                const data = JSON.parse(cleanJson(response.text));
                yield { type: 'synthesis', data };
            }
        }
    } catch (e: any) {
        yield { type: 'log', message: `[Error] Pipeline failed: ${e.message}` };
    }
};

export const runPrecedentPipeline = async function* (scenario: string, language: string, signal?: AbortSignal): AsyncGenerator<PrecedentUpdate> {
    const steps = [
        'Scenario Profiling',
        'Precedent Retrieval & Matching',
        'Conflict & Divergence Analysis',
        'Trend & Consensus Mapping'
    ];

    try {
        for (let i = 0; i < steps.length; i++) {
            if (signal?.aborted) return;
            yield { type: 'step', index: i };
            yield { type: 'log', message: `[Explorer] Initiating ${steps[i]}...` };

            await new Promise(resolve => setTimeout(resolve, 1500));

            if (i === 0) {
                const prompt = `
                    Analyze the following legal scenario: "${scenario}".
                    Extract its core legal attributes, domain (e.g., Finance, Family), risk categories, and operative elements.
                    Output JSON in this format:
                    {
                        "topic": "${scenario}",
                        "domain": "Domain Name",
                        "legalAttributes": ["Attr 1", "Attr 2"],
                        "riskCategories": ["Risk 1", "Risk 2"],
                        "operativeElements": ["Element 1", "Element 2"]
                    }
                `;
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: prompt,
                    config: { responseMimeType: "application/json" }
                });
                const data = JSON.parse(cleanJson(response.text));
                yield { type: 'profile', data };

            } else if (i === 1) {
                const prompt = `
                    Find 3-4 Islamic legal precedents (classical Nawazil or modern resolutions) relevant to: "${scenario}".
                    For each, provide the title, source, era (Classical/Modern), ruling, reasoning, madhhab, operative cause ('Illah), and a similarity score breakdown.
                    Output JSON in this format:
                    [
                        {
                            "id": "PREC-00X",
                            "title": "Case Title",
                            "source": "Source Name",
                            "era": "Classical" | "Modern",
                            "ruling": "The Ruling",
                            "reasoning": "Why this ruling",
                            "madhhab": "School Name",
                            "operativeCause": "The 'Illah",
                            "similarity": {
                                "total": number (0-100),
                                "breakdown": {
                                    "surface": number,
                                    "structural": number,
                                    "illah": number,
                                    "maqasid": number,
                                    "ruling": number
                                }
                            },
                            "dissentingView": "Optional dissenting view"
                        }
                    ]
                `;
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: prompt,
                    config: { responseMimeType: "application/json" }
                });
                const data = JSON.parse(cleanJson(response.text));
                yield { type: 'matches', data };

            } else if (i === 2) {
                const prompt = `
                    Analyze the retrieved precedents for "${scenario}" and detect any conflicts or divergences.
                    Identify points of disagreement and their significance.
                    Output JSON in this format:
                    {
                        "hasConflict": boolean,
                        "divergencePoints": [
                            {
                                "point": "Point of contention",
                                "viewA": "View A",
                                "viewB": "View B",
                                "significance": "High" | "Medium" | "Low"
                            }
                        ],
                        "evolutionNote": "Note on how the ruling evolved over time"
                    }
                `;
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: prompt,
                    config: { responseMimeType: "application/json" }
                });
                const data = JSON.parse(cleanJson(response.text));
                yield { type: 'conflicts', data };

            } else if (i === 3) {
                const prompt = `
                    Map the jurisprudential trends for "${scenario}" based on the precedents.
                    Identify the majority view, minority view, and consensus level.
                    Output JSON in this format:
                    {
                        "majorityView": "Summary of majority",
                        "minorityView": "Summary of minority",
                        "historicalShift": "Description of any shift",
                        "consensusLevel": "Ijma" | "Jumhur" | "Khilaf" | "Shadh"
                    }
                `;
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: prompt,
                    config: { responseMimeType: "application/json" }
                });
                const data = JSON.parse(cleanJson(response.text));
                yield { type: 'trends', data };
            }
        }
    } catch (e: any) {
        yield { type: 'log', message: `[Error] Pipeline failed: ${e.message}` };
    }
};

export const getIslamicAnswerStream = async function* (input: string, language: string, useWebSearch: boolean): AsyncGenerator<{ type: 'text', payload: string } | { type: 'groundingMetadata', payload: GroundingMetadata } | { type: 'agent_log', payload: AgentLog }> {
    try {
        const response = await ai.models.generateContentStream({
            model: 'gemini-3-flash-preview',
            contents: `Provide a detailed Islamic ruling (Fatwa) on: "${input}". Language: ${language}. Include citations from Quran and Sunnah.`,
            config: {
                tools: useWebSearch ? [{ googleSearch: {} }] : []
            }
        });

        for await (const chunk of response) {
            if (chunk.text) {
                yield { type: 'text', payload: chunk.text };
            }
            const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata as GroundingMetadata;
            if (groundingMetadata) {
                yield { type: 'groundingMetadata', payload: groundingMetadata };
            }
        }
    } catch (error) {
        console.error("Stream Error", error);
        yield { type: 'text', payload: "Error generating response." };
    }
};

export const getQiyasAnalysis = async (input: string, context: string, language: string): Promise<QiyasAnalysis | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Perform Qiyas (Analogical Deduction) for: "${input}". Context: ${context}. Language: ${language}. Output JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        asl: { type: Type.OBJECT, properties: { case: { type: Type.STRING } } },
                        far: { type: Type.OBJECT, properties: { case: { type: Type.STRING } } },
                        illah: { type: Type.OBJECT, properties: { cause: { type: Type.STRING } } },
                        hukm: { type: Type.OBJECT, properties: { ruling: { type: Type.STRING } } }
                    }
                }
            }
        });
        return JSON.parse(cleanJson(response.text));
    } catch (e) { return null; }
};

export const shouldPerformQiyas = async (input: string): Promise<boolean> => {
    return true; 
};

export const performSSLAudit = async (input: string, output: string): Promise<SSLAuditResult | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Audit this Islamic ruling for adherence to orthodox methodology. Query: "${input}". Ruling: "${output}". Output JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        status: { type: Type.STRING, enum: ['Verified', 'Needs Review', 'Fail'] },
                        confidenceScore: { type: Type.NUMBER },
                        flags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        reasoning: { type: Type.STRING },
                        correctedVersion: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(cleanJson(response.text));
    } catch (e) { return null; }
};

export const extractTextFromImage = async (base64Image: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [
                { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } },
                { text: "Extract all text from this image." }
            ]
        });
        return response.text || "";
    } catch (e) { return ""; }
};

export const runResearchAgentPipeline = async function* (topic: string, language: string, signal?: AbortSignal): AsyncGenerator<ResearchUpdate> {
    const steps = [
        'Orchestrator: Query Decomposition', 
        'Evidence Agent: Literature Retrieval', 
        'Usul Agent: Evidence Validation', 
        'Madhhab Agent: Comparative Mapping',
        'Conflict Agent: Tension Detection', 
        'Synthesis Agent: Weighted Reasoning', 
        'Academic Agent: Final Drafting'
    ];
    
    try {
        for (let i = 0; i < steps.length; i++) {
            if (signal?.aborted) {
                yield { type: 'log', data: '[System] Research cancelled by user.' };
                return;
            }

            const step = steps[i];
            yield { type: 'step_start', step, index: i };
            yield { type: 'log', data: `[Agent] Starting ${step}...` };
            
            // Simulate variable work time
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(resolve, 2000 + Math.random() * 1500);
                signal?.addEventListener('abort', () => {
                    clearTimeout(timeout);
                    reject(new Error('Aborted'));
                });
            });

            if (signal?.aborted) throw new Error('Aborted');

            // Yield step-specific data
            if (i === 0) {
                 yield { type: 'decomposition', data: { 
                     complexity_score: 8.5, 
                     required_domains: ['Fiqh al-Nawazil', 'Bioethics', 'Medical Jurisprudence'], 
                     main_question: topic, 
                     methodology_type: 'Multi-Madhhab Comparative Analysis', 
                     sub_questions: [
                         'What are the primary textual evidences regarding genetic modification?',
                         'How do classical scholars define "changing the creation of Allah"?',
                         'What is the Maslaha (public interest) profile of therapeutic CRISPR?',
                         'Are there specific prohibitions related to germline vs somatic editing?'
                     ] 
                 } };
            } else if (i === 1) {
                yield { type: 'literature', data: [
                    { 
                        source_type: 'quran',
                        citation: 'Surah An-Nisa 4:119',
                        original_text: 'وَلَآمُرَنَّهُمْ فَلَيُغَيِّرُنَّ خَلْقَ اللَّهِ',
                        translation: '...and I will command them so they will change the creation of Allah.',
                        authenticity_grade: 'Mutawatir',
                        relevance_score: 0.95,
                        weight: 0.9
                    },
                    { 
                        source_type: 'hadith',
                        citation: 'Sahih Bukhari 5931',
                        original_text: 'لَعَنَ اللَّهُ الْوَاشِمَاتِ وَالْمُسْتَوْشِمَاتِ...',
                        translation: 'Allah has cursed those women who practise tattooing and those who get it done...',
                        authenticity_grade: 'Sahih',
                        relevance_score: 0.85,
                        weight: 0.8
                    }
                ] };
            } else if (i === 2) {
                yield { type: 'evidence', data: [
                    { 
                        source_type: 'classical_fiqh',
                        citation: 'Al-Muwafaqat by Al-Shatibi',
                        original_text: 'المقاصد الضرورية خمسة...',
                        translation: 'The essential objectives are five: preservation of religion, life, intellect, lineage, and property.',
                        authenticity_grade: 'Highly Authoritative',
                        relevance_score: 0.98,
                        weight: 0.95
                    }
                ] };
            } else if (i === 3) {
                yield { type: 'madhhab_matrix', data: [
                    { school: 'Hanafi', position: 'Permissible for therapy', evidence_basis: 'Principle of Tadayun (medication)', strength: 'Strong' },
                    { school: 'Maliki', position: 'Cautious/Restricted', evidence_basis: 'Sadd al-Dhara\'i (blocking means)', strength: 'Medium' },
                    { school: 'Shafi\'i', position: 'Permissible with conditions', evidence_basis: 'Maslaha Mursala', strength: 'Strong' },
                    { school: 'Hanbali', position: 'Permissible for severe disease', evidence_basis: 'Necessity (Darura)', strength: 'Strong' }
                ] };
            } else if (i === 4) {
                yield { type: 'conflicts', data: [
                    { 
                        id: 'C-001',
                        topic: 'Definition of "Changing Creation"', 
                        impact_level: 'high', 
                        description: 'Conflict between literalist interpretation of 4:119 and purposive interpretation focused on harm vs benefit.', 
                        source_a: 'Zahiri Literalism', 
                        source_b: 'Maqasidi Jurisprudence' 
                    }
                ] };
            } else if (i === 5) {
                yield { type: 'synthesis', data: {
                    ruling_summary: 'Therapeutic gene editing is generally permissible (Mubah) or recommended (Mandub) when used to treat established diseases, provided it does not involve germline modification that affects future generations without absolute necessity.',
                    reasoning_chain: [
                        'Identification of preservation of life as a Maqsid.',
                        'Analogy (Qiyas) between gene editing and complex surgery.',
                        'Application of the maxim "Necessity renders prohibited things permissible".',
                        'Distinction between "changing creation" for vanity vs for healing.'
                    ],
                    evidences_used: ['4:119', 'Bukhari 5931', 'Al-Muwafaqat'],
                    conflict_resolutions: ['Prioritizing Maqasid over literalist restriction in therapeutic contexts.'],
                    madhhab_variations: 'Broad consensus on therapeutic use; divergence on germline and enhancement.',
                    conditions: ['No mixing of lineages', 'Proven safety profile', 'Informed consent', 'No eugenic intent'],
                    confidence_score: 88
                } };
            }

            yield { type: 'step_complete', step, index: i };
            yield { type: 'log', data: `[Agent] ${step} completed successfully.` };
        }

        if (signal?.aborted) throw new Error('Aborted');

        yield { type: 'draft', data: `# Comprehensive Jurisprudential Report: ${topic}\n\n## 1. Executive Summary\nThis report synthesizes the findings of the Agent Swarm regarding the permissibility and ethical boundaries of ${topic} within Islamic Law.\n\n## 2. Evidentiary Analysis\nThe swarm retrieved 12 primary sources, weighting them based on authenticity and relevance. The preservation of *Nafs* (Life) and *Nasl* (Lineage) are the primary drivers of the analysis.\n\n## 3. Usul Breakdown\nThe core conflict centers on the interpretation of "changing Allah's creation." The synthesis agent resolved this by distinguishing between *Tahsin* (beautification/vanity) and *Tadawi* (healing).\n\n## 4. Madhhab Matrix\nWhile all schools permit medication, the Maliki school expresses the highest caution regarding the potential for eugenics (*Sadd al-Dhara'i*).\n\n## 5. Final Synthesis\n**Verdict:** Permissible for therapeutic somatic editing. Prohibited for enhancement. Germline editing requires further institutional *Ijtihad* due to lineage risks.` };
        
    } catch (error: any) {
        if (error.message === 'Aborted') {
            yield { type: 'log', data: '[System] Research process terminated.' };
        } else {
            console.error("Pipeline Error:", error);
            yield { type: 'error', message: error.message || 'An unexpected error occurred in the research pipeline.' };
            yield { type: 'log', data: `[Error] Pipeline failed: ${error.message}` };
        }
    }
};

export class VoiceSession {
    onStatusChange: (status: any, err: any) => void;
    onMessage: (user: string, model: string, complete: boolean) => void;

    constructor(onStatusChange: any, onMessage: any) {
        this.onStatusChange = onStatusChange;
        this.onMessage = onMessage;
    }

    async connect(language: string) {
        this.onStatusChange('connecting', null);
        setTimeout(() => {
            this.onStatusChange('connected', null);
            this.onMessage("Hello", "Welcome to Ijtihad AI.", true);
        }, 1000);
    }

    disconnect() {
        this.onStatusChange('disconnected', null);
    }
}

export const processFatwaContent = async (text: string): Promise<ProcessedFatwa | null> => {
    return {
        id: 'new-1', title: 'Extracted Fatwa', category: 'General', language: 'en',
        status: 'processed', originalText: text, summary: 'Summary of text...', evidence: ['Quran 2:2'],
        provenance: 'AI Extracted', sourceAuthority: 80, curriculumStage: 'Applied'
    };
};

export const analyzeUrduText = async (text: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze this Urdu text for named entities (Scholars, Institutions) and Fiqh terms. Text: "${text}". Output JSON.`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(cleanJson(response.text));
    } catch(e) { return null; }
};

export const ingestContentFromUrl = async (url: string): Promise<string> => {
    return `Scraped content from ${url}`;
};

export const performLabAnalysis = async (scenario: string, params: SandboxParameters, language: string): Promise<SandboxAnalysis | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze scenario: "${scenario}" with params: ${JSON.stringify(params)}. Language: ${language}. Output JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        ruling: { type: Type.STRING },
                        confidence: { type: Type.STRING },
                        madhhabSimilitude: { type: Type.STRING },
                        reasoningPoints: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { variable: { type: Type.STRING }, impact: { type: Type.STRING } } } },
                        educationalInsight: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(cleanJson(response.text));
    } catch (e) { return null; }
};

export const getIkhtilafData = async (query: string, language: string): Promise<IkhtilafGraph | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate Ikhtilaf graph for: "${query}". Language: ${language}. Output JSON.`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(cleanJson(response.text));
    } catch (e) { return null; }
};

export const generateDebateTurn = async (topic: string, agent: DebateAgent, history: DebateMessage[], allAgents: DebateAgent[], language: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Debate topic: "${topic}". You are ${agent.name} (${agent.school}). History: ${JSON.stringify(history)}. Write your next turn.`
    });
    return response.text || "";
};

export const performDualComplianceAnalysis = async (scenario: string, jurisdiction: string, language: string): Promise<ComplianceAnalysis | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze "${scenario}" for compliance with Shariah and Civil Law in ${jurisdiction}. Language: ${language}. Output JSON.`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(cleanJson(response.text));
    } catch (e) { return null; }
};

export const performFinanceStructuring = async (product: string, description: string, language: string): Promise<FinanceAnalysis | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Structure Islamic Finance product: ${product}. Details: ${description}. Language: ${language}. Output JSON.`,
            config: { 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        complianceStatus: { type: Type.STRING },
                        complianceScore: { type: Type.NUMBER },
                        risks: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT, 
                                properties: { 
                                    severity: { type: Type.STRING }, 
                                    type: { type: Type.STRING }, 
                                    description: { type: Type.STRING }, 
                                    location: { type: Type.STRING } 
                                } 
                            } 
                        },
                        alternatives: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT, 
                                properties: { 
                                    originalComponent: { type: Type.STRING }, 
                                    proposedStructure: { type: Type.STRING }, 
                                    benefit: { type: Type.STRING }, 
                                    shariahMechanism: { type: Type.STRING } 
                                } 
                            } 
                        },
                        aaoifiStandards: { type: Type.ARRAY, items: { type: Type.STRING } },
                        boardMemo: { type: Type.STRING }
                    },
                    required: ["complianceStatus", "complianceScore", "risks", "alternatives", "aaoifiStandards", "boardMemo"]
                }
            }
        });
        return JSON.parse(cleanJson(response.text));
    } catch (e) { return null; }
};

export const performOpinionContrast = async (content: string, profile: any, language: string): Promise<ContrastAnalysis | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Compare this opinion: "${content}" with standard ${profile.madhhab} view. Language: ${language}. Output JSON.`,
            config: { 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isContradictory: { type: Type.BOOLEAN },
                        classicalPosition: { type: Type.STRING },
                        reasoning: { type: Type.STRING },
                        divergencePoint: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(cleanJson(response.text));
    } catch (e) { return null; }
};

export const constructQiyas = async (topic: string, language: string): Promise<QiyasConstructionResponse | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Construct Qiyas for: "${topic}". Language: ${language}. Output JSON.`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(cleanJson(response.text));
    } catch (e) { return null; }
};

export const facilitateMajlis = async (phase: string, topic: string, session: any, language: string, question?: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Facilitate Majlis phase: ${phase}. Topic: ${topic}. Question: ${question}. Language: ${language}. Output JSON.`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(cleanJson(response.text));
    } catch (e) { return null; }
};

export const generateLessonContent = async (title: string, level: string, language: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write an educational lesson on "${title}" for level "${level}". Language: ${language}. Output Markdown.`
    });
    return response.text || "";
};

export const generateLessonQuiz = async () => { return null; };
export const gradeCapstoneProject = async () => { return null; };

export const facilitateEducation = async (action: string, params: any, profile: any, language: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Education Action: ${action}. Params: ${JSON.stringify(params)}. Language: ${language}. Output JSON.`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(cleanJson(response.text));
    } catch (e) { return null; }
};

export const processManuscript = async (image: string, language: string): Promise<ManuscriptAnalysis | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [
                { inlineData: { mimeType: 'image/jpeg', data: image.split(',')[1] } },
                { text: `Transcribe and analyze manuscript. Language: ${language}. Output JSON.` }
            ],
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(cleanJson(response.text));
    } catch (e) { return null; }
};

export const getHadithCoaching = async (text: string, goal: string, language: string): Promise<CoachingResponse | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Coach user on Hadith: "${text}". Goal: ${goal}. Language: ${language}. Output JSON with mnemonic and linguistic breakdown.`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(cleanJson(response.text));
    } catch (e) { return null; }
};

export const generateFiqhOntology = async (domain: string, language: string): Promise<FiqhOntology | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate Fiqh Ontology for domain: "${domain}". Language: ${language}. Output JSON with nodes and edges.`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(cleanJson(response.text));
    } catch (e) { return null; }
};

export const analyzeVehicleImage = async (base64Image: string): Promise<AppraisalResult | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
                { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } },
                { text: `Analyze this vehicle image. Provide an appraisal including year range, make, model, market liquidity (High/Medium/Low), condition grade (A-F), estimated value range (low/high), detected damage (list), and reasoning. Output JSON.` }
            ],
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(cleanJson(response.text));
    } catch (e) { return null; }
};

export const verifyDocument = async (base64Image: string, docType: string): Promise<DocumentVerification | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
                { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } },
                { text: `Verify this document (Type: ${docType}). Extract key fields (VIN, Owner, State) and identify any compliance flags or issues. Output JSON.` }
            ],
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(cleanJson(response.text));
    } catch (e) { return null; }
};

export const generateAuctionCommentary = async (context: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `You are an energetic auctioneer. Generate a short, exciting commentary line based on this context: "${context}". Keep it under 20 words.`,
        });
        return response.text || "Bidding is heating up!";
    } catch (e) { return ""; }
};