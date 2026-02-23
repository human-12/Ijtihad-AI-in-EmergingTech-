
import React from 'react';
import type { VehicleListing } from '../types';
import { ArrowRightIcon } from './icons';

const MOCK_LISTINGS: VehicleListing[] = [
    { id: '1', make: 'Porsche', model: '911 GT3', year: 2022, price: 215000, condition: 'Used', mileage: 4500, type: 'Retail', image: 'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&w=800&q=80', location: 'Los Angeles, CA', vin: 'WP0...' },
    { id: '2', make: 'Ford', model: 'Bronco Raptor', year: 2023, price: 88000, condition: 'New', mileage: 120, type: 'Retail', image: 'https://images.unsplash.com/photo-1627454820574-fb4ec46784ea?auto=format&fit=crop&w=800&q=80', location: 'Dallas, TX', vin: '1FM...' },
    { id: '3', make: 'Mercedes-Benz', model: 'G63 AMG', year: 2021, price: 159000, condition: 'Used', mileage: 12000, type: 'Auction', image: 'https://images.unsplash.com/photo-1553440683-1b9dc8c78b8b?auto=format&fit=crop&w=800&q=80', location: 'Miami, FL', vin: 'WDC...', bids: 14, timeLeft: '2h 15m' },
    { id: '4', make: 'Tesla', model: 'Cybertruck', year: 2024, price: 110000, condition: 'New', mileage: 50, type: 'Auction', image: 'https://images.unsplash.com/photo-1600016259029-79ba03c3917d?auto=format&fit=crop&w=800&q=80', location: 'Austin, TX', vin: '5YJ...', bids: 42, timeLeft: '45m' },
];

export const Marketplace: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto p-6 animate-fade-in-down pb-20">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">Inventory <span className="text-slate-500 text-sm font-normal ml-2">{MOCK_LISTINGS.length} Vehicles</span></h2>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/20">Retail</button>
                    <button className="px-4 py-2 bg-white/5 rounded-lg text-xs font-bold text-slate-400 hover:text-white">Wholesale</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {MOCK_LISTINGS.map(car => (
                    <div key={car.id} className="bg-[#1c1c1e] rounded-2xl overflow-hidden border border-white/5 group hover:border-white/20 transition-all">
                        <div className="relative h-48 overflow-hidden">
                            <img src={car.image} alt={car.model} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
                            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold uppercase text-white">
                                {car.condition}
                            </div>
                            {car.type === 'Auction' && (
                                <div className="absolute top-3 right-3 bg-red-600 px-2 py-1 rounded text-[10px] font-bold uppercase text-white animate-pulse">
                                    Ends in {car.timeLeft}
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-white text-sm">{car.year} {car.make}</h3>
                                    <p className="text-slate-400 text-xs">{car.model}</p>
                                </div>
                                <span className="text-sm font-black text-white">${car.price.toLocaleString()}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 mb-4 font-mono">
                                <div className="bg-white/5 p-1.5 rounded flex items-center justify-center">{car.mileage.toLocaleString()} mi</div>
                                <div className="bg-white/5 p-1.5 rounded flex items-center justify-center">{car.location.split(',')[1].trim()}</div>
                            </div>

                            <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white uppercase tracking-wider transition flex items-center justify-center gap-2 group-hover:bg-blue-600">
                                {car.type === 'Auction' ? 'Place Bid' : 'Purchase'} <ArrowRightIcon className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
