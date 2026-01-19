
import React, { useState } from 'react';

interface CreditCardProps {
  balance: number;
  limit: number;
  isFrozen: boolean;
  onToggleFreeze: () => void;
}

export const CreditCard: React.FC<CreditCardProps> = ({ balance, limit, isFrozen, onToggleFreeze }) => {
  const [showDetails, setShowDetails] = useState(false);
  const logoUrl = "https://drive.google.com/uc?export=view&id=1Az2dqZ3DOe24eRw4YFnS0NRqb2S8OkfI";

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Premium White/Platinum Card Container with Enhanced Shadow */}
      <div 
        onClick={() => setShowDetails(!showDetails)}
        className={`relative w-full aspect-[1.586/1] rounded-[22px] p-8 cursor-pointer transition-all duration-700 overflow-hidden group
          ${isFrozen ? 'grayscale-[0.5] opacity-80' : 'hover:scale-[1.03] active:scale-95'}
          bg-gradient-to-br from-[#ffffff] via-[#fcfdfe] to-[#f1f5f9] border border-[#e2e8f0]`}
        style={{
          // Multi-layered shadow for premium "real" depth on white backgrounds
          boxShadow: isFrozen 
            ? '0 10px 20px -5px rgba(0, 0, 0, 0.1)' 
            : '0 30px 60px -12px rgba(0, 0, 0, 0.15), 0 18px 36px -18px rgba(0, 0, 0, 0.2), inset 0 0 1px 1px rgba(255, 255, 255, 0.9)'
        }}
      >
        {/* Realistic Micro-Texture Overlay (Brushed Finish) */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply"
             style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 1px, #000 1px, #000 2px)' }}></div>
        
        {/* Refined Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

        {/* Card Content */}
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            {/* Premium Silver/Gold EMV Chip */}
            <div className="w-14 h-11 bg-gradient-to-br from-[#cbd5e1] via-[#f8fafc] to-[#94a3b8] rounded-lg relative overflow-hidden border border-black/5 shadow-sm">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-black/10"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-black/10"></div>
              <div className="absolute inset-2 border-[0.5px] border-black/5 rounded-sm"></div>
              <div className="absolute inset-3 border-[0.5px] border-black/5 rounded-sm"></div>
              <div className="absolute top-0 left-1/4 w-[1px] h-full bg-black/5"></div>
              <div className="absolute top-0 right-1/4 w-[1px] h-full bg-black/5"></div>
            </div>

            {/* Logo and Brand */}
            <div className="text-right">
               <div className="flex items-center gap-2 justify-end">
                 <img 
                    src={logoUrl} 
                    alt="Solux" 
                    className="h-8 w-auto object-contain transition-transform group-hover:scale-110 duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                 />
                 <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">SOLUX</span>
               </div>
               <span className="text-[7px] uppercase tracking-[0.4em] text-slate-400 font-bold block mt-1">WHITE PLATINUM</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Card Number with Subtle Depth */}
            <div className="relative">
              <p className="text-2xl font-mono tracking-[0.25em] text-slate-800 drop-shadow-sm">
                {showDetails ? '4532 8891 2201 4452' : '•••• •••• •••• 4452'}
              </p>
              {/* Silver numbering shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-400/10 to-transparent skew-x-12 translate-x-[-150%] group-hover:translate-x-[200%] transition-transform duration-1500 pointer-events-none"></div>
            </div>

            <div className="flex justify-between items-end">
              <div className="flex gap-10">
                <div className="space-y-0.5">
                  <p className="text-[6px] uppercase font-black text-slate-400 tracking-widest">VALID THRU</p>
                  <p className="text-sm font-bold text-slate-700 tracking-widest">09 / 28</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[6px] uppercase font-black text-slate-400 tracking-widest">CVV CODE</p>
                  <p className="text-sm font-bold text-slate-700 tracking-widest">{showDetails ? '882' : '•••'}</p>
                </div>
              </div>
              
              {/* Premium Holographic Patch (Light Theme) */}
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-200 border border-slate-200 shadow-inner overflow-hidden relative">
                <div className="absolute inset-0 opacity-30 mix-blend-overlay animate-pulse bg-gradient-to-tr from-cyan-400 via-purple-400 to-pink-400"></div>
                <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-white/60 to-transparent rotate-[30deg] animate-infinite-slide"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                   <i className="fa-solid fa-shield-halved text-xs text-black"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient light reflections for premium white feel */}
        <div className="absolute -top-1/4 -left-1/4 w-full h-full bg-gradient-to-br from-white via-transparent to-transparent opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-slate-200/30 to-transparent pointer-events-none"></div>
      </div>

      {/* Modern Control Bar */}
      <div className="flex items-center justify-between border border-gray-100 p-4 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-2.5 h-2.5 rounded-full ${isFrozen ? 'bg-red-500' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]'}`}></div>
            {!isFrozen && <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20"></div>}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900 block leading-none">
              {isFrozen ? 'Card Frozen' : 'Live Authorization'}
            </span>
            <span className="text-[8px] text-slate-400 font-bold tracking-tight">SOLUX SECURE PROTOCOL</span>
          </div>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFreeze();
          }}
          className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-[0.1em] transition-all uppercase border
            ${isFrozen ? 'bg-black text-white border-black hover:bg-slate-800' : 'bg-white text-slate-400 border-slate-100 hover:text-black hover:border-black shadow-sm'}`}
        >
          {isFrozen ? 'REACTIVATE' : 'LOCK CARD'}
        </button>
      </div>
    </div>
  );
};
