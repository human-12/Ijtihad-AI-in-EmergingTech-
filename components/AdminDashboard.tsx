
import React, { useState, useRef, useEffect } from 'react';
import { processFatwaContent, analyzeUrduText, extractTextFromImage, ingestContentFromUrl } from '../services/geminiService';
import type { ProcessedFatwa, ReviewItem, AuditLogEntry } from '../types';
import { 
    DatabaseIcon, 
    ServerIcon, 
    TagIcon, 
    RefreshIcon, 
    LoaderIcon, 
    FileTextIcon, 
    CheckIcon, 
    SearchIcon,
    CodeIcon,
    ScanIcon,
    TextSelectIcon,
    AlertTriangleIcon,
    MessageSquareIcon,
    GitBranchIcon,
    ShieldAlertIcon,
    FileLockIcon,
    NetworkIcon,
    TrendingUpIcon,
    BookOpenIcon,
    GavelIcon,
    ScaleIcon,
    LightbulbIcon
} from './icons';

interface AdminDashboardProps {
    language: 'en' | 'ar' | 'ur';
}

type Tab = 'ingestion' | 'pipeline' | 'dataset' | 'tuning' | 'ocr' | 'review' | 'audit';

const SAMPLE_RAW_TEXT = `Question: I work as a freelance graphic designer. Sometimes clients ask me to design logos for companies that sell alcohol or interest-based financial services. Is my income from this permissible?

Answer: 
Praise be to Allah.
Helping in sin and transgression is prohibited. Allah says (interpretation of the meaning): "Help you one another in Al-Birr and At-Taqwa (virtue, righteousness and piety); but do not help one another in sin and transgression." [Al-Ma'idah 5:2].
Designing logos for companies whose primary business is haram (like alcohol or riba) is considered assisting in sin. Therefore, it is not permissible to accept such work, and the income derived from it is unlawful. You should seek lawful alternatives, and whoever gives up something for the sake of Allah, Allah will replace it with something better.`;

const SAMPLE_URDU_TEXT = `مولانا اشرف علی تھانوی اپنی کتاب بہشتی زیور میں فرماتے ہیں کہ نماز کے دوران اگر کوئی شخص جان بوجھ کر بات کرے تو اس کی نماز فاسد ہو جائے گی۔ اسی طرح اگر دارالعلوم دیوبند کے مفتیان کرام کا فتویٰ دیکھا جائے تو وہ بھی یہی فرماتے ہیں۔ فقہ حنفی میں اس مسئلے پر اجماع ہے کہ عمل کثیر سے نماز ٹوٹ جاتی ہے۔`;

// Mock Knowledge Graph Index for linking entities
const KNOWLEDGE_GRAPH_INDEX = new Set([
    "Ashraf Ali Thanvi", "Maulana Ashraf Ali Thanvi",
    "Darul Uloom Deoband", "Deoband",
    "Hanafi", "Fiqh Hanafi", "Bahishti Zewar",
    "Ijma", "Salah", "Namaz", "Fatwa"
]);

// Helper to find context and count
const getEntityMetadata = (text: string, entity: string) => {
    if (!text || !entity) return { count: 0, context: '' };
    const normalizedText = text;
    const parts = normalizedText.split(entity);
    const count = parts.length - 1;
    
    const idx = normalizedText.indexOf(entity);
    if (idx === -1) return { count: 0, context: '' };
    
    const start = Math.max(0, idx - 30);
    const end = Math.min(normalizedText.length, idx + entity.length + 30);
    let context = normalizedText.substring(start, end);
    
    if (start > 0) context = '...' + context;
    if (end < normalizedText.length) context = context + '...';
    
    return { count, context };
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ language }) => {
    const [activeTab, setActiveTab] = useState<Tab>('ingestion');
    const [scrapedData, setScrapedData] = useState<string[]>([]);
    const [processing, setProcessing] = useState(false);
    const [dataset, setDataset] = useState<ProcessedFatwa[]>([
        {
            id: 'f-101', title: 'Combining Prayers (Travel)', category: 'Ibadah', language: 'en',
            status: 'published', originalText: '', summary: '', evidence: [], 
            provenance: 'Expert', sourceAuthority: 95, curriculumStage: 'Applied'
        },
        {
            id: 'f-102', title: 'Crypto Futures', category: 'Muamalat', language: 'en',
            status: 'draft', originalText: '', summary: '', evidence: [], 
            provenance: 'Synthetic', sourceAuthority: 40, curriculumStage: 'Comparative'
        },
        {
            id: 'f-103', title: 'Wudu Socks', category: 'Ibadah', language: 'ur',
            status: 'processed', originalText: '', summary: '', evidence: [], 
            provenance: 'Weak', sourceAuthority: 20, curriculumStage: 'Applied'
        }
    ]);
    const [scrapeUrl, setScrapeUrl] = useState('');
    const [isScraping, setIsScraping] = useState(false);
    const [rawText, setRawText] = useState(SAMPLE_RAW_TEXT);
    
    // OCR & NER States
    const [ocrImage, setOcrImage] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [ocrText, setOcrText] = useState('');
    const [isNerProcessing, setIsNerProcessing] = useState(false);
    const [nerResults, setNerResults] = useState<{ scholars: string[], institutions: string[], fiqhTerms: string[], summaryEnglish: string } | null>(null);
    const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
    const [linkedEntities, setLinkedEntities] = useState<Set<string>>(new Set());
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Review & Config States
    const [reviewQueue, setReviewQueue] = useState<ReviewItem[]>([
        {
            id: '101',
            query: 'Ruling on combining prayers for traveler',
            response: 'The Hanafis generally do not allow combining prayers except at Hajj, while other schools permit it.',
            flagReason: 'Conflicting Evidence detected between schools',
            conflictDetails: {
                sourceA: { text: "Hanafis do not combine prayers.", source: "Al-Hidayah (Hanafi)" },
                sourceB: { text: "Traveler may combine prayers.", source: "Kitab al-Umm (Shafi'i)" }
            },
            status: 'pending',
            confidenceScore: 0.85
        },
        {
            id: '102',
            query: 'Is gelatin halal?',
            response: 'Gelatin derived from pork is haram. Gelatin from halal animals is halal.',
            flagReason: 'Active Learning Trigger: Low Confidence',
            status: 'pending',
            confidenceScore: 0.45,
            activeLearningTrigger: true
        }
    ]);
    const [selectedReviewItem, setSelectedReviewItem] = useState<ReviewItem | null>(null);
    const [expertCorrection, setExpertCorrection] = useState('');

    // Mock Audit Logs
    const [auditLogs] = useState<AuditLogEntry[]>([
        {
            id: 'LOG-1709823912000',
            timestamp: 1709823912000,
            queryHash: '0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
            actionType: 'RESEARCH_QUERY',
            sslStatus: 'published',
            userHash: '0xUser-123',
            confidenceScore: 0.95
        },
        {
            id: 'LOG-1709824155000',
            timestamp: 1709824155000,
            queryHash: '0x3c2a9d8b7e6f5a4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0',
            actionType: 'RESEARCH_QUERY',
            sslStatus: 'ssl_flagged',
            userHash: '0xUser-456'
        },
        {
            id: 'LOG-1709824500000',
            timestamp: 1709824500000,
            queryHash: '0xa1b2c3d4e5f60718293a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6',
            actionType: 'CONFLICT_RESOLUTION',
            sslStatus: 'published',
            userHash: '0xAdmin-001',
            conflictDetected: true,
            resolutionPrinciple: 'Maslaha (Public Interest)',
            conflictDescription: 'Resolved dispute between Hanafi and Shafi sources on medical treatment using alcohol.'
        }
    ]);

    // Check extracted entities against Knowledge Graph on result load
    useEffect(() => {
        if (nerResults) {
            const found = new Set<string>();
            const allEntities = [
                ...(nerResults.scholars || []),
                ...(nerResults.institutions || []),
                ...(nerResults.fiqhTerms || [])
            ];
            
            allEntities.forEach(e => {
                // Simple partial match logic for the demo
                const isFound = Array.from(KNOWLEDGE_GRAPH_INDEX).some(
                    known => e.includes(known) || known.includes(e)
                );
                if (isFound) found.add(e);
            });
            setLinkedEntities(found);
        } else {
            setLinkedEntities(new Set());
        }
    }, [nerResults]);

    const handleScrape = async () => {
        if (!scrapeUrl) return;
        setIsScraping(true);
        setScrapedData([]); 

        const addLog = (msg: string) => setScrapedData(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

        try {
            addLog(`Initializing scraper for: ${scrapeUrl}...`);
            await new Promise(r => setTimeout(r, 800));
            addLog(`Resolving host... Connected.`);
            await new Promise(r => setTimeout(r, 600));
            addLog(`Fetching content stream via grounded search...`);

            const content = await ingestContentFromUrl(scrapeUrl);
            
            if (content) {
                addLog(`Payload received: ${content.length} bytes.`);
                await new Promise(r => setTimeout(r, 500));
                addLog(`Parsing DOM and extracting main text...`);
                setRawText(content);
                addLog(`✔ Ingestion Complete. Data loaded into Raw Text buffer.`);
            } else {
                addLog(`⚠ Warning: Content extraction yielded empty result.`);
            }
        } catch (e) {
            addLog(`❌ Error: Ingestion failed.`);
        } finally {
            setIsScraping(false);
            setScrapeUrl('');
        }
    };

    const handleRunPipeline = async () => { setProcessing(true); const result = await processFatwaContent(rawText); if (result) { setDataset(prev => [result, ...prev]); } setProcessing(false); };
    
    const handleTriggerUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setOcrImage(e.target.result as string);
                    setOcrText(""); 
                    setNerResults(null); 
                    setSelectedEntity(null);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePerformOcr = async () => { 
        if (!ocrImage) return; 
        setIsScanning(true);
        
        // Check if it's the placeholder or a real uploaded image
        if (ocrImage === "placeholder_scan") {
            // Simulation fallback
            setTimeout(() => { 
                setOcrText(SAMPLE_URDU_TEXT); 
                setIsScanning(false); 
            }, 2000);
        } else {
            // Real OCR via Gemini Vision
            try {
                const text = await extractTextFromImage(ocrImage);
                if (text) {
                    setOcrText(text);
                } else {
                    setOcrText("Failed to extract text from image.");
                }
            } catch (e) {
                console.error(e);
                setOcrText("Error during OCR processing.");
            } finally {
                setIsScanning(false);
            }
        }
    };
    
    const handleRunNer = async () => { if (!ocrText) return; setIsNerProcessing(true); const results = await analyzeUrduText(ocrText); setNerResults(results); setIsNerProcessing(false); };
    const handleResolveConflict = (itemId: string, resolution: string) => { setReviewQueue(prev => (prev || []).map(item => item.id === itemId ? { ...item, status: 'resolved', feedback: resolution } : item)); setSelectedReviewItem(null); setExpertCorrection(''); };
    const handleSimulateUpload = () => { setOcrImage("placeholder_scan"); setOcrText(""); setNerResults(null); setSelectedEntity(null); };


    const renderHighlightedText = (text: string, highlight: string | null) => {
        if (!highlight) return text;
        const safeHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const parts = text.split(new RegExp(`(${safeHighlight})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === highlight.toLowerCase() ?
                <span key={i} className="bg-[var(--accent-gold)] text-black rounded px-1 mx-0.5 box-decoration-clone font-bold shadow-sm animate-pulse">{part}</span> :
                part
        );
    };

    const renderIngestion = () => ( <div className="space-y-6 animate-fade-in-down"><div className="glass-panel p-6 rounded-2xl"><h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2"><DatabaseIcon className="w-6 h-6 text-[var(--accent-blue)]" />Data Ingestion / Scraping</h3><div className="flex gap-4 mb-6"><input type="text" value={scrapeUrl} onChange={(e) => setScrapeUrl(e.target.value)} placeholder="Enter URL to scrape..." className="flex-grow bg-black/30 border border-[var(--panel-border)] rounded-xl p-3 text-slate-200 focus:ring-2 focus:ring-[var(--accent-blue)] outline-none"/><button onClick={handleScrape} disabled={isScraping || !scrapeUrl} className="px-6 py-3 bg-[var(--accent-blue)] text-white rounded-xl font-semibold hover:bg-blue-600 transition disabled:opacity-50 flex items-center gap-2">{isScraping ? <LoaderIcon className="w-5 h-5" /> : <RefreshIcon className="w-5 h-5" />}Start Scraping</button></div><div className="bg-black/40 rounded-xl p-4 min-h-[200px] border border-[var(--panel-border)] font-mono text-xs text-slate-400"><p className="mb-2 text-slate-500 uppercase tracking-widest font-bold">Scraper Logs</p>{(scrapedData || []).length === 0 ? (<span className="italic opacity-50">Waiting for tasks...</span>) : (<ul className="space-y-1">{(scrapedData || []).map((log, i) => <li key={i} className="text-green-400/80">{log}</li>)}</ul>)}</div></div></div>);
    const renderPipeline = () => ( <div className="space-y-6 animate-fade-in-down"><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="glass-panel p-6 rounded-2xl flex flex-col"><h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2"><FileTextIcon className="w-6 h-6 text-[var(--accent-gold)]" />Raw Fatwa Text</h3><textarea value={rawText} onChange={(e) => setRawText(e.target.value)} className="flex-grow bg-black/30 border border-[var(--panel-border)] rounded-xl p-4 text-slate-300 font-mono text-sm focus:ring-2 focus:ring-[var(--accent-gold)] outline-none resize-none min-h-[300px]"/><button onClick={handleRunPipeline} disabled={processing || !rawText} className="mt-4 w-full py-3 bg-[var(--accent-gold)] text-black rounded-xl font-bold hover:brightness-110 transition disabled:opacity-50 flex justify-center items-center gap-2">{processing ? <LoaderIcon className="w-5 h-5" /> : <ServerIcon className="w-5 h-5" />}Run NLP Pipeline</button></div><div className="glass-panel p-6 rounded-2xl bg-black/40"><h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2"><TagIcon className="w-6 h-6 text-green-400" />Processed Output</h3>{dataset && dataset.length > 0 ? (<div className="space-y-4"><div><span className="text-xs font-bold text-slate-500 uppercase">Title</span><p className="text-slate-200 font-semibold">{dataset[0].title}</p></div><div className="flex gap-4"><div><span className="text-xs font-bold text-slate-500 uppercase">Category</span><span className="block text-[var(--accent-blue)] bg-[var(--accent-blue)]/10 px-2 py-1 rounded text-sm mt-1">{dataset[0].category}</span></div><div><span className="text-xs font-bold text-slate-500 uppercase">Language</span><span className="block text-slate-300 mt-1 uppercase text-sm">{dataset[0].language}</span></div></div><div><span className="text-xs font-bold text-slate-500 uppercase">Summary</span><p className="text-slate-400 text-sm mt-1">{dataset[0].summary}</p></div><div><span className="text-xs font-bold text-slate-500 uppercase">Extracted Evidence</span><ul className="list-disc list-inside text-sm text-green-300/80 mt-1">{(dataset[0].evidence || []).map((ev, i) => <li key={i}>{ev}</li>)}</ul></div><div className="pt-4 mt-4 border-t border-white/10 flex items-center gap-2 text-green-400 text-sm"><CheckIcon className="w-4 h-4" />Ready for Indexing</div></div>) : (<div className="h-full flex flex-col items-center justify-center text-slate-500"><ServerIcon className="w-12 h-12 mb-2 opacity-20" /><p>Run the pipeline to see results</p></div>)}</div></div></div>);
    const renderDataset = () => (
        <div className="glass-panel p-6 rounded-2xl animate-fade-in-down h-[600px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                    <DatabaseIcon className="w-6 h-6 text-purple-400" />Knowledge Base (Fatwa Dataset)
                </h3>
                <div className="flex gap-2">
                    <div className="relative">
                        <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input type="text" placeholder="Search dataset..." className="pl-9 pr-4 py-2 bg-black/30 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none" />
                    </div>
                </div>
            </div>
            <div className="flex-grow overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs font-bold text-slate-500 uppercase border-b border-slate-700">
                            <th className="p-3">Title</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Provenance (Authority)</th>
                            <th className="p-3">Curriculum Stage</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-800">
                        {(!dataset || dataset.length === 0) ? (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-500">No data available.</td></tr>
                        ) : (
                            dataset.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition">
                                    <td className="p-3 font-medium text-slate-200">{item.title}</td>
                                    <td className="p-3">
                                        <span className="px-2 py-0.5 rounded bg-blue-900/30 text-blue-300 text-xs">{item.category}</span>
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                                            item.provenance === 'Expert' ? 'bg-green-900/30 text-green-300 border-green-800' :
                                            item.provenance === 'Synthetic' ? 'bg-purple-900/30 text-purple-300 border-purple-800' :
                                            'bg-orange-900/30 text-orange-300 border-orange-800'
                                        }`}>
                                            {item.provenance} ({item.sourceAuthority}%)
                                        </span>
                                    </td>
                                    <td className="p-3 text-slate-400 text-xs">{item.curriculumStage || '-'}</td>
                                    <td className="p-3">
                                        <span className="text-green-400 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> {item.status}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <button className="text-slate-400 hover:text-white underline">Edit</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    const renderTuning = () => {
        const stages = [
            { id: 1, name: 'Fundamentals (Matn)', progress: 100, description: 'Core Quran/Hadith text ingestion', status: 'completed' },
            { id: 2, name: 'Comparative (Ikhtilaf)', progress: 85, description: 'Processing divergence between 4 schools', status: 'active' },
            { id: 3, name: 'Applied (Nawazil)', progress: 45, description: 'Contemporary ruling derivation (Fatwa)', status: 'pending' }
        ];

        return (
            <div className="space-y-8 animate-fade-in-down">
                <div className="glass-panel p-8 rounded-3xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 flex items-center justify-center">
                            <TrendingUpIcon className="w-6 h-6 text-[var(--accent-gold)]" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Curriculum Learning</h3>
                            <p className="text-slate-400 text-sm">Staged model training progression: Simple to Complex</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                        {/* Connecting Line */}
                        <div className="absolute top-8 left-0 w-full h-0.5 bg-slate-800 -z-10 hidden md:block"></div>

                        {stages.map((stage) => (
                            <div key={stage.id} className={`p-6 rounded-2xl border transition-all ${
                                stage.status === 'completed' ? 'bg-green-950/20 border-green-500/30' :
                                stage.status === 'active' ? 'bg-[var(--accent-blue)]/10 border-[var(--accent-blue)]/50 scale-105 shadow-xl' :
                                'bg-black/20 border-white/5 opacity-60'
                            }`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                        stage.status === 'completed' ? 'bg-green-500 text-black' :
                                        stage.status === 'active' ? 'bg-[var(--accent-blue)] text-white animate-pulse' :
                                        'bg-slate-700 text-slate-400'
                                    }`}>
                                        {stage.status === 'completed' ? <CheckIcon className="w-4 h-4" /> : stage.id}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Stage {stage.id}</span>
                                </div>
                                <h4 className={`text-lg font-bold mb-2 ${stage.status === 'active' ? 'text-white' : 'text-slate-300'}`}>{stage.name}</h4>
                                <p className="text-xs text-slate-400 mb-6 min-h-[40px]">{stage.description}</p>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                                        <span>Mastery</span>
                                        <span>{stage.progress}%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${
                                                stage.status === 'completed' ? 'bg-green-500' :
                                                stage.status === 'active' ? 'bg-[var(--accent-blue)]' :
                                                'bg-slate-600'
                                            }`} 
                                            style={{ width: `${stage.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 flex justify-center">
                        <button className="px-8 py-3 bg-[var(--accent-gold)] text-black font-bold rounded-xl hover:brightness-110 transition flex items-center gap-2 shadow-lg shadow-[var(--accent-gold)]/20">
                            <LoaderIcon className="w-5 h-5 animate-spin" />
                            Continue Curriculum Training
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-panel p-6 rounded-2xl">
                        <h4 className="text-sm font-bold text-slate-300 uppercase mb-4 flex items-center gap-2">
                            <ScaleIcon className="w-4 h-4" /> Loss Function (Convergence)
                        </h4>
                        <div className="h-40 flex items-end gap-1 pb-4 border-b border-slate-700">
                            {[60, 55, 48, 40, 35, 30, 28, 25, 20, 15, 12, 10, 8, 7, 5].map((val, i) => (
                                <div key={i} className="flex-1 bg-[var(--accent-blue)]/50 rounded-t hover:bg-[var(--accent-blue)] transition-colors" style={{ height: `${val}%` }}></div>
                            ))}
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                            <span>Epoch 0</span>
                            <span>Epoch 100</span>
                        </div>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                        <LightbulbIcon className="w-12 h-12 text-purple-400 mb-4 opacity-80" />
                        <h4 className="text-lg font-bold text-slate-200 mb-1">Active Learning Loop</h4>
                        <p className="text-xs text-slate-400 max-w-xs mb-4">
                            The model is currently flagging <span className="text-white font-bold">12%</span> of responses for human review based on uncertainty sampling.
                        </p>
                        <div className="flex items-center gap-2 px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg">
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                            <span className="text-xs font-bold text-purple-300 uppercase">Loop Active</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderOcrNer = () => (
        <div className="space-y-6 animate-fade-in-down">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl flex flex-col">
                    <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
                        <ScanIcon className="w-6 h-6 text-[var(--accent-gold)]" />
                        Nastaliq OCR Processor
                    </h3>
                    <div 
                        onClick={handleTriggerUpload}
                        className={`flex-grow border-2 border-dashed rounded-xl flex items-center justify-center transition-all cursor-pointer min-h-[300px] relative overflow-hidden group ${
                            ocrImage ? 'border-[var(--accent-blue)] bg-black/20' : 'border-slate-700 hover:border-slate-500 hover:bg-white/5'
                        }`}
                    >
                        {ocrImage ? (
                            <div className="text-center relative z-10">
                                <img src={ocrImage} alt="Scanned Document" className="max-h-[250px] max-w-full object-contain mx-auto mb-2 rounded-md shadow-lg" />
                                <p className="text-xs text-slate-400 mt-2">Click to replace image</p>
                            </div>
                        ) : (
                            <div className="text-center p-8">
                                <ScanIcon className="w-12 h-12 text-slate-600 mx-auto mb-4 group-hover:text-slate-400 transition" />
                                <p className="text-slate-400 font-semibold">Click to upload Urdu Fatwa Scan</p>
                                <p className="text-xs text-slate-600 mt-2">Supports .jpg, .png with Nastaliq script</p>
                            </div>
                        )}
                        {isScanning && (
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--accent-gold)]/20 to-transparent w-full h-[10%] animate-[scan_2s_linear_infinite] border-b border-[var(--accent-gold)] z-20"></div>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="hidden" 
                        />
                    </div>
                    <div className="flex gap-2 mt-4">
                        {!ocrImage && (
                            <button 
                                onClick={handleSimulateUpload}
                                className="w-full py-3 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition"
                            >
                                Load Sample Image
                            </button>
                        )}
                        <button 
                            onClick={handlePerformOcr}
                            disabled={!ocrImage || isScanning || !!ocrText}
                            className={`w-full py-3 text-white rounded-xl font-bold transition flex justify-center items-center gap-2 ${
                                !ocrImage || isScanning || !!ocrText
                                ? 'bg-slate-700 opacity-50 cursor-not-allowed' 
                                : 'bg-[var(--accent-blue)] hover:bg-blue-600'
                            }`}
                        >
                            {isScanning ? <><LoaderIcon className="w-5 h-5" /> Scanning Text...</> : <><TextSelectIcon className="w-5 h-5" /> Extract Text</>}
                        </button>
                    </div>
                </div>
                 <div className="glass-panel p-6 rounded-2xl flex flex-col bg-black/40">
                    <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
                        <TagIcon className="w-6 h-6 text-green-400" />
                        Urdu Entity Recognition (NER)
                    </h3>
                     <div className="bg-black/30 rounded-xl p-4 border border-[var(--panel-border)] min-h-[150px] mb-4 overflow-y-auto max-h-[300px]">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase block">Extracted Urdu Text</span>
                            {selectedEntity && (
                                <button onClick={() => setSelectedEntity(null)} className="text-[10px] text-slate-400 hover:text-white bg-white/10 px-2 py-1 rounded transition-colors">
                                    Clear Highlight
                                </button>
                            )}
                        </div>
                        {ocrText ? (
                            <p className="text-slate-200 text-right leading-loose font-serif text-lg whitespace-pre-wrap" dir="rtl" style={{ fontFamily: '"Noto Sans Arabic", serif' }}>
                                {renderHighlightedText(ocrText, selectedEntity)}
                            </p>
                        ) : (
                            <p className="text-slate-600 italic text-sm">No text extracted yet. Scan an image first.</p>
                        )}
                    </div>
                    <div className="flex-grow">
                        {nerResults ? (
                            <div className="space-y-4 animate-fade-in-down">
                                <div>
                                    <span className="text-xs font-bold text-indigo-400 uppercase flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Scholars (Ulama)
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {(nerResults.scholars || []).map((s, i) => {
                                            const { count, context } = getEntityMetadata(ocrText, s);
                                            const isLinked = linkedEntities.has(s);
                                            return (
                                                <div key={i} className="relative group inline-block">
                                                    <button 
                                                        onClick={() => setSelectedEntity(s)}
                                                        className={`px-2 py-1 rounded text-xs transition flex items-center gap-1 border
                                                        ${selectedEntity === s ? 'ring-2 ring-indigo-400' : ''}
                                                        ${isLinked 
                                                            ? 'bg-indigo-900/60 border-indigo-500 text-indigo-200' 
                                                            : 'bg-indigo-900/30 border-indigo-700/50 text-indigo-300'}
                                                        `}
                                                        title={`Found ${count} times\n${isLinked ? 'Linked to Knowledge Graph' : 'Not in Knowledge Graph'}\nContext: "${context}"`}
                                                    >
                                                        {s} 
                                                        <span className="opacity-50 text-[10px]">({count})</span>
                                                        {isLinked && <NetworkIcon className="w-3 h-3 text-[var(--accent-gold)] ml-1" />}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        {(nerResults.scholars || []).length === 0 && <span className="text-xs text-slate-500 italic">None detected</span>}
                                    </div>
                                </div>
                                
                                <div>
                                    <span className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Institutions (Madaris)
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {(nerResults.institutions || []).map((s, i) => {
                                             const { count, context } = getEntityMetadata(ocrText, s);
                                             const isLinked = linkedEntities.has(s);
                                             return (
                                                <button 
                                                    key={i} 
                                                    onClick={() => setSelectedEntity(s)}
                                                    className={`px-2 py-1 rounded text-xs transition flex items-center gap-1 border
                                                    ${selectedEntity === s ? 'ring-2 ring-emerald-400' : ''}
                                                    ${isLinked 
                                                        ? 'bg-emerald-900/60 border-emerald-500 text-emerald-200' 
                                                        : 'bg-emerald-900/30 border-emerald-700/50 text-emerald-300'}
                                                    `}
                                                    title={`Found ${count} times\n${isLinked ? 'Linked to Knowledge Graph' : 'Not in Knowledge Graph'}\nContext: "${context}"`}
                                                >
                                                    {s} 
                                                    <span className="opacity-50 text-[10px]">({count})</span>
                                                    {isLinked && <NetworkIcon className="w-3 h-3 text-[var(--accent-gold)] ml-1" />}
                                                </button>
                                            );
                                        })}
                                        {(nerResults.institutions || []).length === 0 && <span className="text-xs text-slate-500 italic">None detected</span>}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-xs font-bold text-amber-400 uppercase flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500"></div> Fiqh Terms
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {(nerResults.fiqhTerms || []).map((s, i) => {
                                             const { count, context } = getEntityMetadata(ocrText, s);
                                             const isLinked = linkedEntities.has(s);
                                             return (
                                                <button 
                                                    key={i} 
                                                    onClick={() => setSelectedEntity(s)}
                                                    className={`px-2 py-1 rounded text-xs transition flex items-center gap-1 border
                                                    ${selectedEntity === s ? 'ring-2 ring-amber-400' : ''}
                                                    ${isLinked 
                                                        ? 'bg-amber-900/60 border-amber-500 text-amber-200' 
                                                        : 'bg-amber-900/30 border-amber-700/50 text-amber-300'}
                                                    `}
                                                    title={`Found ${count} times\n${isLinked ? 'Linked to Knowledge Graph' : 'Not in Knowledge Graph'}\nContext: "${context}"`}
                                                >
                                                    {s} 
                                                    <span className="opacity-50 text-[10px]">({count})</span>
                                                    {isLinked && <NetworkIcon className="w-3 h-3 text-[var(--accent-gold)] ml-1" />}
                                                </button>
                                            );
                                        })}
                                        {(nerResults.fiqhTerms || []).length === 0 && <span className="text-xs text-slate-500 italic">None detected</span>}
                                    </div>
                                </div>
                                
                                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                    <span className="text-xs font-bold text-slate-500 uppercase block mb-1">English Summary</span>
                                    <p className="text-slate-300 text-sm">{nerResults.summaryEnglish}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 min-h-[200px]">
                                <TagIcon className="w-12 h-12 mb-2 opacity-20" />
                                <button 
                                    onClick={handleRunNer}
                                    disabled={!ocrText || isNerProcessing}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isNerProcessing ? <LoaderIcon className="w-4 h-4" /> : <CodeIcon className="w-4 h-4" />}
                                    Run Entity Recognition
                                </button>
                            </div>
                        )}
                    </div>
                </div>
             </div>
        </div>
    );

    const renderReview = () => (
        <div className="animate-fade-in-down h-[600px] flex gap-6">
            <div className="w-1/3 glass-panel p-0 rounded-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-[var(--panel-border)] bg-black/20">
                    <h3 className="font-bold text-slate-200 flex items-center gap-2">
                        <AlertTriangleIcon className="w-5 h-5 text-[var(--accent-gold)]" />
                        Review Queue
                    </h3>
                    <div className="flex gap-2 mt-2">
                        <button className="text-[10px] px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-300">All</button>
                        <button className="text-[10px] px-2 py-1 rounded bg-red-900/30 text-red-300 border border-red-500/30">Low Confidence</button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {(reviewQueue || []).map(item => (
                        <div 
                            key={item.id} 
                            onClick={() => setSelectedReviewItem(item)}
                            className={`p-4 border-b border-[var(--panel-border)] cursor-pointer transition hover:bg-white/5 ${selectedReviewItem?.id === item.id ? 'bg-[var(--accent-blue)]/10 border-l-4 border-l-[var(--accent-blue)]' : (item.status === 'resolved' ? 'opacity-50' : '')}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-mono text-slate-500">#{item.id}</span>
                                {item.activeLearningTrigger ? (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                                        <LightbulbIcon className="w-3 h-3" /> Active Learn
                                    </span>
                                ) : (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${item.status === 'pending' ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>{item.status}</span>
                                )}
                            </div>
                            <h4 className="font-semibold text-sm text-slate-200 mb-1 line-clamp-1">{item.query}</h4>
                            <p className="text-xs text-slate-400 line-clamp-2">{item.flagReason}</p>
                            {item.confidenceScore !== undefined && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="h-1 flex-grow bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.confidenceScore < 0.7 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${item.confidenceScore * 100}%`}}></div>
                                    </div>
                                    <span className="text-[10px] text-slate-500">{Math.round(item.confidenceScore * 100)}% Conf.</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-2/3 glass-panel p-6 rounded-2xl flex flex-col">
                {selectedReviewItem ? (
                    <div className="h-full flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-200 mb-1">{selectedReviewItem.query}</h3>
                                <p className="text-sm text-red-400 flex items-center gap-1">
                                    <ShieldAlertIcon className="w-4 h-4" /> {selectedReviewItem.flagReason}
                                </p>
                            </div>
                        </div>
                        
                        <div className="bg-black/30 rounded-xl p-4 border border-[var(--panel-border)] mb-6">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Original Response</h4>
                            <p className="text-slate-300 text-sm leading-relaxed">{selectedReviewItem.response}</p>
                        </div>

                        {selectedReviewItem.activeLearningTrigger ? (
                            <div className="bg-orange-900/10 border border-orange-500/20 p-4 rounded-xl mb-6">
                                <h4 className="text-sm font-bold text-orange-400 mb-2 flex items-center gap-2">
                                    <LightbulbIcon className="w-4 h-4" /> Active Learning Feedback Loop
                                </h4>
                                <p className="text-xs text-orange-200/70 mb-3">
                                    This response had low confidence ({Math.round((selectedReviewItem.confidenceScore || 0) * 100)}%). 
                                    Provide the expert correction below to feed back into the training curriculum.
                                </p>
                                <textarea 
                                    value={expertCorrection}
                                    onChange={(e) => setExpertCorrection(e.target.value)}
                                    placeholder="Enter the correct ruling or missing evidence..."
                                    className="w-full bg-black/40 border border-orange-500/30 rounded-lg p-3 text-sm text-slate-200 focus:ring-1 focus:ring-orange-500 outline-none h-24 resize-none"
                                />
                                <div className="flex justify-end mt-2">
                                    <button 
                                        onClick={() => handleResolveConflict(selectedReviewItem.id, expertCorrection || 'Annotated')}
                                        disabled={!expertCorrection.trim()}
                                        className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <TrendingUpIcon className="w-4 h-4" /> Commit to Training
                                    </button>
                                </div>
                            </div>
                        ) : selectedReviewItem.conflictDetails ? (
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 rounded-xl bg-red-900/10 border border-red-900/30">
                                    <span className="text-xs font-bold text-red-400 uppercase mb-2 block">Source A</span>
                                    <p className="text-sm text-slate-300 mb-2">"{selectedReviewItem.conflictDetails.sourceA.text}"</p>
                                    <span className="text-xs text-slate-500 italic">{selectedReviewItem.conflictDetails.sourceA.source}</span>
                                </div>
                                <div className="p-4 rounded-xl bg-blue-900/10 border border-blue-900/30">
                                    <span className="text-xs font-bold text-blue-400 uppercase mb-2 block">Source B</span>
                                    <p className="text-sm text-slate-300 mb-2">"{selectedReviewItem.conflictDetails.sourceB.text}"</p>
                                    <span className="text-xs text-slate-500 italic">{selectedReviewItem.conflictDetails.sourceB.source}</span>
                                </div>
                            </div>
                        ) : null}

                        {!selectedReviewItem.activeLearningTrigger && (
                            <div className="mt-auto">
                                <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                                    <MessageSquareIcon className="w-4 h-4" /> Resolution Decision
                                </h4>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => handleResolveConflict(selectedReviewItem.id, 'Prioritize Source A')}
                                        disabled={selectedReviewItem.status === 'resolved'}
                                        className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                                    >
                                        Uphold Source A
                                    </button>
                                    <button 
                                        onClick={() => handleResolveConflict(selectedReviewItem.id, 'Prioritize Source B')}
                                        disabled={selectedReviewItem.status === 'resolved'}
                                        className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                                    >
                                        Uphold Source B
                                    </button>
                                    <button 
                                        onClick={() => handleResolveConflict(selectedReviewItem.id, 'Synthesize / Neutral')}
                                        disabled={selectedReviewItem.status === 'resolved'}
                                        className="flex-1 py-3 bg-[var(--accent-blue)] text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition disabled:opacity-50"
                                    >
                                        Synthesize
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                        <AlertTriangleIcon className="w-12 h-12 mb-3 opacity-20" />
                        <p>Select a flagged item to review</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderAudit = () => (
        <div className="space-y-6 animate-fade-in-down">
             <div className="glass-panel p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                        <FileLockIcon className="w-6 h-6 text-[var(--accent-gold)]" />
                        System Audit Logs
                    </h3>
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-sm flex items-center gap-2 transition">
                        <DownloadIcon className="w-4 h-4" /> Export CSV
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-slate-500 font-bold uppercase text-xs border-b border-white/10">
                            <tr>
                                <th className="pb-3 pl-2">Timestamp</th>
                                <th className="pb-3">Action Type</th>
                                <th className="pb-3">User Hash</th>
                                <th className="pb-3">Query Hash</th>
                                <th className="pb-3">SSL Status</th>
                                <th className="pb-3">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                            {(auditLogs || []).map(log => (
                                <tr key={log.id} className="hover:bg-white/5 transition">
                                    <td className="py-3 pl-2 font-mono text-slate-500 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="py-3"><span className="bg-slate-800 px-2 py-1 rounded text-xs">{log.actionType}</span></td>
                                    <td className="py-3 font-mono text-xs text-slate-500">{log.userHash.substring(0, 8)}...</td>
                                    <td className="py-3 font-mono text-xs text-[var(--accent-blue)]">{log.queryHash.substring(0, 10)}...</td>
                                    <td className="py-3">
                                        <span className={`flex items-center gap-1.5 ${log.sslStatus === 'published' ? 'text-green-400' : 'text-red-400'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${log.sslStatus === 'published' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            {log.sslStatus}
                                        </span>
                                    </td>
                                    <td className="py-3 text-slate-500 italic max-w-xs truncate">
                                        {log.conflictDescription || (log.confidenceScore ? `Confidence: ${log.confidenceScore}` : '-')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
        </div>
    );

    const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    );

    return (
        <div className="max-w-7xl mx-auto pb-12 animate-fade-in-down">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
                    <ServerIcon className="w-8 h-8 text-purple-500" />
                    Admin & Knowledge Pipeline
                </h2>
                <p className="text-slate-400 mt-2">Manage datasets, scrape fatwas, review flagged content, and process raw OCR data.</p>
            </header>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <nav className="w-full lg:w-64 flex-shrink-0 space-y-2">
                    {[
                        { id: 'ingestion', label: 'Data Ingestion', icon: DatabaseIcon },
                        { id: 'ocr', label: 'OCR & NER', icon: ScanIcon },
                        { id: 'pipeline', label: 'NLP Pipeline', icon: GitBranchIcon },
                        { id: 'dataset', label: 'Knowledge Base', icon: FileTextIcon },
                        { id: 'tuning', label: 'Curriculum Training', icon: TrendingUpIcon },
                        { id: 'review', label: 'Review Queue', icon: AlertTriangleIcon },
                        { id: 'audit', label: 'Audit Logs', icon: FileLockIcon },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as Tab)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === item.id ? 'bg-[var(--accent-blue)] text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                            {item.id === 'review' && (reviewQueue || []).filter(q => q.status === 'pending').length > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 rounded-full font-bold">{(reviewQueue || []).filter(q => q.status === 'pending').length}</span>
                            )}
                        </button>
                    ))}
                    
                    <div className="mt-8 pt-6 border-t border-white/5 px-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">System Status</h4>
                        <div className="space-y-3 text-xs">
                             <div className="flex justify-between text-slate-300">
                                <span>Vector DB</span>
                                <span className="text-green-400">Online</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                                <span>Gemini API</span>
                                <span className="text-green-400">v1.5-Pro</span>
                            </div>
                             <div className="flex justify-between text-slate-300">
                                <span>Last Index</span>
                                <span className="text-slate-500">2h ago</span>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content Area */}
                <div className="flex-grow min-w-0">
                    {activeTab === 'ingestion' && renderIngestion()}
                    {activeTab === 'ocr' && renderOcrNer()}
                    {activeTab === 'pipeline' && renderPipeline()}
                    {activeTab === 'dataset' && renderDataset()}
                    {activeTab === 'tuning' && renderTuning()}
                    {activeTab === 'review' && renderReview()}
                    {activeTab === 'audit' && renderAudit()}
                </div>
            </div>
        </div>
    );
};
