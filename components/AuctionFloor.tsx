
import React, { useState, useEffect } from 'react';
import { generateAuctionCommentary } from '../services/geminiService';
import { ArrowRightIcon } from './icons';

export const AuctionFloor: React.FC = () => {
    const [bid, setBid] = useState(42000);
    const [commentary, setCommentary] = useState("We have a 2024 CyberTruck Foundation Series on the block!");
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        const interval = setInterval(async () => {
            if (Math.random() > 0.7) {
                const newBid = bid + 500;
                setBid(newBid);
                setLogs(prev => [`Bidder ${Math.floor(Math.random()*9000)}: $${newBid.toLocaleString()}`, ...prev.slice(0, 5)]);
            }
            if (Math.random() > 0.8) {
                const comm = await generateAuctionCommentary(`Tesla Cybertruck, 42k bid, intense bidding`);
                setCommentary(comm);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [bid]);

    return (
        <div className="max-w-7xl mx-auto p-6 h-[calc(100vh-100px)] flex flex-col animate-fade-in-down">
            <div className="flex-grow grid grid-cols-12 gap-6">
                {/* Main Stage */}
                <div className="col-span-8 bg-[#1c1c1e] rounded-3xl overflow-hidden relative border border-white/10 flex flex-col">
                    <div className="flex-grow relative bg-black">
                        <img src="https://images.unsplash.com/photo-1600016259029-79ba03c3917d?auto=format&fit=crop&w=1200&q=80" className="w-full h-full object-cover opacity-80" />
                        <div className="absolute top-4 left-4 bg-red-600 px-3 py-1 rounded text-xs font-bold text-white animate-pulse">LIVE</div>
                        
                        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent">
                            <h2 className="text-4xl font-black text-white mb-2">2024 Tesla Cybertruck</h2>
                            <p className="text-xl text-slate-300 italic">"{commentary}"</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="col-span-4 flex flex-col gap-4">
                    <div className="bg-[#1c1c1e] p-6 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center h-1/3">
                        <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Current Bid</span>
                        <span className="text-5xl font-black text-green-500 my-2">${bid.toLocaleString()}</span>
                        <span className="text-xs text-slate-400">Reserve Met</span>
                    </div>

                    <div className="bg-[#1c1c1e] p-6 rounded-3xl border border-white/10 flex-grow overflow-hidden flex flex-col">
                        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest border-b border-white/5 pb-2">Bid History</h3>
                        <div className="space-y-2 overflow-y-auto custom-scrollbar flex-col-reverse flex">
                            {logs.map((log, i) => (
                                <div key={i} className="text-sm font-mono text-slate-300 flex justify-between">
                                    <span>{log.split(':')[0]}</span>
                                    <span className="text-green-400">{log.split(':')[1]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={() => { setBid(bid + 1000); setLogs(prev => [`YOU: $${(bid+1000).toLocaleString()}`, ...prev]); }}
                        className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black text-xl rounded-3xl uppercase tracking-widest transition shadow-lg shadow-blue-900/20"
                    >
                        Place Bid ${ (bid + 1000).toLocaleString() }
                    </button>
                </div>
            </div>
        </div>
    );
};
