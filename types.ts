
// QA & Session
export interface QASession {
    question: string;
    answer: string;
    timestamp?: number;
}

export interface GroundingChunk {
    web?: {
        uri: string;
        title: string;
    };
}

export interface GroundingMetadata {
    groundingChunks?: GroundingChunk[];
}

export interface AgentLog {
    agent: string;
    message: string;
}

// Qiyas
export interface QiyasAnalysis {
    asl: { case: string };
    far: { case: string };
    illah: { cause: string };
    hukm: { ruling: string };
}

// Query Refinement
export interface QueryRefinement {
    refinedQuery: string;
    context: {
        madhhab: string;
        region: string;
        urgency: string;
    };
    ambiguityFlags: string[];
    historicalPrecedents: string[];
}

// SSL Audit
export interface SSLAuditResult {
    status: 'Verified' | 'Needs Review' | 'Fail';
    confidenceScore: number;
    flags: string[];
    reasoning: string;
    correctedVersion?: string;
}

export interface SSLReport {
    isSafe: boolean;
    flags: string[];
    traceabilityScore: number;
    status: string;
}

// Research
export interface EvidenceObject {
    source_type: 'quran' | 'hadith' | 'classical_fiqh' | 'contemporary_fatwa';
    citation: string;
    original_text: string;
    translation: string;
    authenticity_grade: string;
    relevance_score: number;
    weight?: number;
}

export interface MadhhabPosition {
    school: string;
    position: string;
    evidence_basis: string;
    strength: string;
}

export interface ConflictNode {
    id: string;
    topic: string;
    description: string;
    impact_level: 'high' | 'medium' | 'low';
    source_a: string;
    source_b: string;
}

export interface DeepResearchState {
    status: 'idle' | 'active' | 'complete';
    currentAgent: string;
    logs: string[];
    decomposition?: {
        complexity_score: number;
        required_domains: string[];
        main_question: string;
        methodology_type: string;
        sub_questions: string[];
    };
    literature: EvidenceObject[];
    evidence: EvidenceObject[];
    madhhab_matrix?: MadhhabPosition[];
    conflicts: ConflictNode[];
    hypotheses: Array<{
        novelty_score: number;
        hypothesis: string;
        basis: string;
    }>;
    methodology?: {
        design_type: string;
        steps: string[];
    };
    synthesis?: {
        ruling_summary: string;
        reasoning_chain: string[];
        evidences_used: string[];
        conflict_resolutions: string[];
        madhhab_variations: string;
        conditions: string[];
        confidence_score: number;
    };
    draft?: string;
    error?: string;
}

export type ResearchUpdate = 
    | { type: 'log'; data: string }
    | { type: 'step_start'; step: string; index: number }
    | { type: 'step_complete'; step: string; index: number }
    | { type: 'error'; message: string }
    | { type: 'decomposition'; data: DeepResearchState['decomposition'] }
    | { type: 'literature'; data: DeepResearchState['literature'] }
    | { type: 'evidence'; data: DeepResearchState['evidence'] }
    | { type: 'madhhab_matrix'; data: DeepResearchState['madhhab_matrix'] }
    | { type: 'conflicts'; data: DeepResearchState['conflicts'] }
    | { type: 'hypotheses'; data: DeepResearchState['hypotheses'] }
    | { type: 'methodology'; data: DeepResearchState['methodology'] }
    | { type: 'synthesis'; data: DeepResearchState['synthesis'] }
    | { type: 'draft'; data: string };

export interface ResearchTopic {
    topic: string;
    timestamp?: number;
}

export interface ResearchData {
    quranicVerses?: any[];
    hadith?: { text: string }[];
    classicalFiqh?: { text: string }[];
}

// History
export interface History {
    qa: QASession[];
    research: ResearchTopic[];
}

// User Profile & Scholar
export interface ScholarProfile {
    name: string;
    madhhab: 'Hanafi' | 'Shafi\'i' | 'Maliki' | 'Hanbali' | 'Athari';
    usulStrictness: number;
    bio: string;
}

export interface PersonalNote {
    id: string;
    title: string;
    content: string;
    tags: string[];
    lastModified: number;
    aiAnalysis?: ContrastAnalysis;
}

export interface WorkspaceAlert {
    id: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
    date: number;
    relatedNoteId?: string;
}

// Contrast Analysis
export interface ContrastAnalysis {
    isContradictory: boolean;
    classicalPosition: string;
    reasoning: string;
    divergencePoint?: string;
}

// Admin Dashboard
export interface ProcessedFatwa {
    id: string;
    title: string;
    category: string;
    language: string;
    status: string;
    originalText: string;
    summary: string;
    evidence: string[];
    provenance: string;
    sourceAuthority: number;
    curriculumStage: string;
}

export interface ReviewItem {
    id: string;
    query: string;
    response: string;
    flagReason: string;
    conflictDetails?: {
        sourceA: { text: string; source: string };
        sourceB: { text: string; source: string };
    };
    status: 'pending' | 'resolved';
    confidenceScore: number;
    activeLearningTrigger?: boolean;
    feedback?: string;
}

export interface AuditLogEntry {
    id: string;
    timestamp: number;
    queryHash: string;
    actionType: string;
    sslStatus: string;
    userHash: string;
    confidenceScore?: number;
    conflictDetected?: boolean;
    resolutionPrinciple?: string;
    conflictDescription?: string;
}

// Lab / Sandbox
export interface SandboxParameters {
    maslaha: number;
    literalism: number;
    urf: number;
    sadd: number;
    hardship: number;
}

export interface SandboxAnalysis {
    ruling: string;
    confidence: string;
    madhhabSimilitude: string;
    reasoningPoints: Array<{ variable: string; impact: string }>;
    educationalInsight: string;
}

// Ikhtilaf Visualizer
export interface IkhtilafNode {
    id: string;
    label: string;
    isMajority?: boolean;
    timePeriod?: string;
    description?: string;
    scholars?: string[];
    size?: number;
    color?: string;
    type?: string;
    evidence?: string[];
}

export interface IkhtilafGraph {
    nodes: IkhtilafNode[];
    edges: Array<{ source: string; target: string; isConflict?: boolean; strength?: number; label?: string }>;
    critical_turning_points?: Array<{ year: string; event: string; impact: string }>;
    consensus_analysis?: {
        strong_consensus: string;
        area_of_dispute: string;
        modern_development?: string;
    };
}

// Debate
export interface DebateAgent {
    id: string;
    name: string;
    school: string;
    color: string;
    usul: string;
}

export interface DebateMessage {
    agentId: string;
    text: string;
    round: number;
    timestamp: number;
}

export interface DebateState {
    question: string;
    messages: DebateMessage[];
    consensusLevel: number;
    isComplete: boolean;
}

// Compliance
export interface DecisionStep {
    type: 'shariah' | 'civil' | 'synthesis';
    step: string;
    outcome: string;
}

export interface ComplianceAnalysis {
    shariahRuling: { verdict: string; evidence: string };
    civilRuling: { verdict: string; relevantLaws: string };
    conflicts: Array<{ point: string; severity: string; description: string }>;
    resolutionStrategy: string;
    safeOptions: string[];
    decisionTree: DecisionStep[];
    riskLevel: 'high' | 'medium' | 'low';
}

// Finance
export interface FinanceAnalysis {
    complianceStatus: string;
    complianceScore: number;
    risks: Array<{ severity: string; type: string; description: string; location: string }>;
    alternatives: Array<{ originalComponent: string; proposedStructure: string; benefit: string; shariahMechanism: string }>;
    aaoifiStandards: string[];
    boardMemo: string;
}

// Qiyas Workbench
export interface QiyasAsl {
    id: string;
    caseName: string;
    hukm: string;
    textualSource: string;
    sourceStrength: 'Mutawatir' | 'Ahad' | 'Ijma' | 'Strong' | 'Medium';
    context: string;
}

export interface QiyasIllah {
    description: string;
    type: 'Mansusah' | 'Mustanbatah'; // Mansusah (Explicit) | Mustanbatah (Inferred)
    justification: string;
    scope: string;
    validationStatus: 'Pending' | 'Valid' | 'Invalid';
}

export interface IllahValidationCriteria {
    munasib: { status: 'Pass' | 'Fail'; reasoning: string };
    zahir: { status: 'Pass' | 'Fail'; reasoning: string };
    mundabit: { status: 'Pass' | 'Fail'; reasoning: string };
    mutaddi: { status: 'Pass' | 'Fail'; reasoning: string };
    noOverride: { status: 'Pass' | 'Fail'; reasoning: string };
}

export interface QiyasFar {
    topic: string;
    attributes: Array<{ name: string; value: string; matchWithAsl: boolean }>;
    similarityScore: number;
}

export interface QiyasConflict {
    type: 'Nass' | 'Ijma' | 'Maqasid' | 'StrongerAsl';
    description: string;
    severity: 'High' | 'Medium' | 'Low';
}

export interface QiyasWorkbenchState {
    status: 'idle' | 'processing' | 'review' | 'complete';
    step: number;
    far: QiyasFar;
    aslCandidates: QiyasAsl[];
    selectedAsl?: QiyasAsl;
    illah?: QiyasIllah;
    validation?: IllahValidationCriteria;
    conflicts: QiyasConflict[];
    confidenceScore: number;
    finalRuling?: string;
    reasoningChain: string[];
    logs: string[];
}

export type QiyasUpdate = 
    | { type: 'log'; message: string }
    | { type: 'step'; index: number }
    | { type: 'far_analysis'; data: QiyasFar }
    | { type: 'asl_candidates'; data: QiyasAsl[] }
    | { type: 'illah_extraction'; data: QiyasIllah }
    | { type: 'validation_report'; data: IllahValidationCriteria }
    | { type: 'conflict_detection'; data: QiyasConflict[] }
    | { type: 'synthesis'; data: { ruling: string; confidence: number; chain: string[] } };

// Qiyas Builder (Legacy/Simple)
export interface QiyasConstructionResponse {
    far: { topic: string; description: string };
    potentialAsls: Array<{ id: string; caseName: string; connection: string; originalRuling: string }>;
    illahScenarios: Array<{ linkedAslId: string; proposedIllah: string; outcome: string }>;
    madhhabPerspectives: Array<{ school: string; analysis: string }>;
    conclusion: string;
}

// Precedent Explorer Types
export interface ScenarioProfile {
    topic: string;
    domain: string;
    legalAttributes: string[];
    riskCategories: string[];
    operativeElements: string[];
}

export interface SimilarityScore {
    total: number;
    breakdown: {
        surface: number;
        structural: number;
        illah: number;
        maqasid: number;
        ruling: number;
    };
}

export interface PrecedentMatch {
    id: string;
    title: string;
    source: string;
    era: 'Classical' | 'Modern';
    ruling: string;
    reasoning: string;
    madhhab: string;
    similarity: SimilarityScore;
    operativeCause: string;
    dissentingView?: string;
    // Legacy fields optional for compatibility if needed, but better to remove if unused
    originalText?: string; 
    differences?: string;
}

export interface ConflictReport {
    hasConflict: boolean;
    divergencePoints: Array<{
        point: string;
        viewA: string;
        viewB: string;
        significance: 'High' | 'Medium' | 'Low';
    }>;
    evolutionNote?: string;
}

export interface TrendSummary {
    majorityView: string;
    minorityView: string;
    historicalShift: string;
    consensusLevel: 'Ijma' | 'Jumhur' | 'Khilaf' | 'Shadh';
}

export interface PrecedentExplorerState {
    status: 'idle' | 'profiling' | 'retrieving' | 'analyzing' | 'complete';
    step: number;
    scenario: ScenarioProfile;
    matches: PrecedentMatch[];
    conflicts: ConflictReport;
    trends: TrendSummary;
    logs: string[];
}

export type PrecedentUpdate = 
    | { type: 'log'; message: string }
    | { type: 'step'; index: number }
    | { type: 'profile'; data: ScenarioProfile }
    | { type: 'matches'; data: PrecedentMatch[] }
    | { type: 'conflicts'; data: ConflictReport }
    | { type: 'trends'; data: TrendSummary };

// Global Majlis
export type MajlisPhase = 'framing' | 'opening' | 'cross_exam' | 'synthesis' | 'qa' | 'conclusion';

export interface MajlisScholar {
    id: string;
    name: string;
    role: string;
    school: string;
    avatarColor: string;
    methodology: string;
}

export interface MajlisTurn {
    speakerId: string;
    content: string;
    citations?: string[];
}

export interface MajlisSession {
    topic: string;
    phase: MajlisPhase;
    scholars: MajlisScholar[];
    preliminaryEvidence: string[];
    transcript: (MajlisTurn & { timestamp: number; round: string })[];
    finalRuling?: {
        majorityPosition: string;
        conditions: string[];
        dissentingOpinion: string;
        confidenceLevel: string;
    };
    transparencyMetrics?: any;
}

// Education
export interface UserProfile {
    name: string;
    currentTitle: string;
    level: number;
    xp: number;
    streakDays: number;
    goals: string[];
    timeCommitment: string;
    learningStyle: string;
    madhhabPreference: string;
    completedLessonIds: string[];
    completedModuleIds: string[];
    earnedBadges: EducationBadge[];
}

export interface EducationBadge {
    id: string;
    title: string;
    icon: string;
    description: string;
    earnedDate: number;
}

export interface EducationLesson {
    id: string;
    title: string;
    type: 'text' | 'video' | 'interactive_matching' | 'interactive_grading' | 'capstone';
    description: string;
    durationMinutes: number;
    isCompleted: boolean;
    isLocked: boolean;
    xpReward: number;
}

export interface EducationModule {
    id: string;
    title: string;
    levelId: number;
    levelTitle: string;
    description: string;
    isCompleted: boolean;
    isLocked: boolean;
    lessons: EducationLesson[];
}

export interface QuizQuestion {
    id: string;
    text: string;
}

export interface CapstoneGrading {
    score: number;
    feedback: string;
}

// Manuscript
export interface ManuscriptAnalysis {
    scriptType: string;
    estimatedCentury: string;
    confidence: number;
    tashkeelText: string;
    entities: Array<{ type: string; text: string }>;
}

// SRS
export interface SRSStatus {
    box: number;
    interval: number;
    dueDate: number;
    lastReviewed: number;
    easeFactor: number;
}

export interface HadithCard {
    id: string;
    deckId: string;
    title: string;
    arabicText: string;
    englishText: string;
    narrator: string;
    reference: string;
    topics: string[];
    srs: SRSStatus;
}

export interface HadithDeck {
    id: string;
    title: string;
    description: string;
    totalCards: number;
    masteredCards: number;
    coverImage: string;
}

export interface CoachingResponse {
    mnemonic: string;
    linguisticBreakdown: Array<{ word: string; meaning: string }>;
}

// Computational Fiqh
export interface FiqhNode {
    id: string;
    label: string;
    type: 'concept' | 'ruling' | 'source' | 'scholar' | 'maxim';
    meta?: { text?: string; school?: string };
}

export interface FiqhEdge {
    source: string;
    target: string;
    relation: string;
}

export interface FiqhOntology {
    nodes: FiqhNode[];
    edges: FiqhEdge[];
    consistencyReport?: {
        score: number;
        contradictions: string[];
    };
}

// Confidence
export interface ScholarlyConfidence {
    score: number;
    level: 'high' | 'medium' | 'low';
    factors: {
        scholarlyAgreement: number;
        evidenceStrength: number;
        usulConsistency: number;
    };
    reasoning: string;
}

// Citation
export interface EvidenceNode {
    id: string;
    sourceType: 'quran' | 'hadith' | 'ijma' | 'qiyas';
    title: string;
    content: string;
    arabicText?: string;
    metadata: {
        reference?: string;
        authenticity?: string;
        narratorChain?: string;
        confidence: number;
    };
}

export interface ProofChain {
    topic: string;
    nodes: EvidenceNode[];
    finalRuling: string;
    totalConfidence: number;
    scholarlyNote: string;
}

// Sheets
export interface LearnedContext {
    question: string;
    answer: string;
}

export interface QAFeedback {
    score: 1 | -1;
    correction?: string;
    category: string;
}

// Appraisal & Verification
export interface AppraisalResult {
    yearRange: string;
    make: string;
    model: string;
    marketLiquidity: 'High' | 'Medium' | 'Low';
    conditionGrade: string;
    estimatedValue: { low: number; high: number };
    detectedDamage: string[];
    analysisReasoning: string;
}

export interface VehicleListing {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    condition: 'New' | 'Used';
    mileage: number;
    type: 'Retail' | 'Auction' | 'Wholesale';
    image: string;
    location: string;
    vin: string;
    bids?: number;
    timeLeft?: string;
}

export interface DocumentVerification {
    complianceStatus: 'Pass' | 'Fail' | 'Review';
    fields: {
        vin?: string;
        ownerName?: string;
        state?: string;
        [key: string]: string | undefined;
    };
    flags: string[];
}