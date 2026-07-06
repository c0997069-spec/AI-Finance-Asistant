import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Sparkles, Heart, Cpu, Compass, Flame } from 'lucide-react';
import { Emotion, Personality } from '../types';
// @ts-ignore
import yukiAvatar from '../assets/images/yuki_vtuber_avatar_1783303846501.jpg';

interface VtuberAvatarProps {
  emotion: Emotion;
  isTalking: boolean;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  onMicClick?: () => void;
  isListening?: boolean;
  personality: Personality;
}

export default function VtuberAvatar({
  emotion,
  isTalking,
  voiceEnabled,
  setVoiceEnabled,
  onMicClick,
  isListening = false,
  personality,
}: VtuberAvatarProps) {
  return (
    <div id="vtuber-section" className="flex flex-col items-center justify-center p-5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden relative min-h-[380px]">
      
      {/* Background Holographic Glow and Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-indigo-500/5 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

      {/* Dynamic Floating Stock/Market Charts next to character matching the image! */}
      <div className="absolute top-8 left-3 w-20 h-16 bg-cyan-950/40 backdrop-blur-md border border-cyan-500/30 rounded-xl p-1.5 pointer-events-none flex flex-col justify-between shadow-lg shadow-cyan-500/10 animate-bounce z-20" style={{ animationDuration: '6s' }}>
        <div className="flex justify-between items-center text-[7px] font-mono text-cyan-300">
          <span>IDX:BBRI</span>
          <span className="text-green-400 font-bold">+2.1%</span>
        </div>
        <svg viewBox="0 0 100 30" className="w-full h-8 stroke-cyan-400 stroke-2 fill-none">
          <path d="M0,25 Q15,10 30,22 T60,5 T90,15 L100,5" />
        </svg>
      </div>

      <div className="absolute top-16 right-3 w-24 h-16 bg-indigo-950/40 backdrop-blur-md border border-indigo-500/30 rounded-xl p-1.5 pointer-events-none flex flex-col justify-between shadow-lg shadow-indigo-500/10 animate-pulse z-20">
        <div className="flex justify-between items-center text-[7px] font-mono text-indigo-300">
          <span>PORTFOLIO</span>
          <span className="text-cyan-400 font-bold">LIVE</span>
        </div>
        <svg viewBox="0 0 100 30" className="w-full h-8 stroke-indigo-400 stroke-2 fill-none">
          <path d="M0,28 L15,22 L30,25 L45,15 L60,18 L75,8 L100,2" />
        </svg>
      </div>

      {/* Floating interactive 2D avatar matching image layout with smooth breathing animation */}
      <motion.div
        animate={{
          y: isTalking ? [0, -4, 0] : [0, -10, 0],
          scale: isTalking ? [1, 1.02, 1] : [1, 1.01, 1],
        }}
        transition={{
          duration: isTalking ? 1.2 : 4.0,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-56 h-72 flex items-center justify-center relative rounded-3xl overflow-hidden shadow-[0_16px_32px_rgba(34,211,238,0.15)] border border-white/10 z-10"
      >
        <img
          src={yukiAvatar}
          alt="Yuki AI VTuber Avatar"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top scale-[1.5] origin-top"
        />

        {/* Emotion and Personality Overlay Effects */}
        <AnimatePresence>
          {emotion === 'excited' && (
            <div className="absolute inset-0 pointer-events-none bg-yellow-400/5">
              <Sparkles className="absolute top-4 left-4 w-4 h-4 text-yellow-400 animate-bounce" />
              <Sparkles className="absolute top-8 right-6 w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              <Sparkles className="absolute bottom-16 left-6 w-3 h-3 text-amber-300 animate-bounce" />
            </div>
          )}
          {personality === 'yandere' && (
            <div className="absolute inset-0 pointer-events-none bg-rose-950/10">
              <Heart className="absolute top-4 left-6 w-4 h-4 text-red-500 fill-red-500 animate-pulse" style={{ animationDuration: '1s' }} />
              <Heart className="absolute bottom-14 right-8 w-3 h-3 text-red-600 fill-red-600 animate-pulse" style={{ animationDuration: '1.5s' }} />
            </div>
          )}
          {personality === 'dandere' && (
            <div className="absolute inset-0 pointer-events-none bg-purple-950/5">
              <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-pink-400/60 animate-ping" />
              <div className="absolute bottom-12 left-6 w-2 h-2 rounded-full bg-purple-400/50 animate-pulse" />
            </div>
          )}
        </AnimatePresence>

        {/* Dynamic Holographic Laser Scanline */}
        <motion.div
          animate={{
            y: ['0%', '14000%']
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute left-0 right-0 h-[2px] bg-cyan-400/60 shadow-[0_0_8px_#22d3ee] pointer-events-none top-0 z-10"
        />

        {/* Small floating digital terminal widget in front of avatar (just like the character holds a slate!) */}
        <div className="absolute bottom-2 right-2 w-20 h-12 bg-cyan-950/85 backdrop-blur-md border border-cyan-400/40 rounded-lg p-1 text-[6px] text-cyan-300 font-mono shadow-lg flex flex-col justify-between pointer-events-none z-10 animate-pulse">
          <div className="flex justify-between">
            <span>BUY</span>
            <span className="text-green-400">TRADING</span>
          </div>
          <div className="h-4 bg-cyan-900/30 rounded flex items-center justify-center">
            <span>BBRI P/E: 11.2</span>
          </div>
        </div>
      </motion.div>

      {/* Assistant Status Badge, Emotion, and Personality Settings */}
      <div className="mt-4 flex flex-col items-center w-full z-10">
        <div className="flex flex-col items-center gap-1">
          {/* Active Personality Pill */}
          <span className="text-[10px] font-mono tracking-widest text-pink-400 font-extrabold uppercase bg-pink-950/60 border border-pink-800/40 px-2.5 py-0.5 rounded">
            Mood: {personality}
          </span>
          
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold tracking-wide text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-3 py-1 rounded-full shadow-inner flex items-center gap-1.5 font-sans">
              {personality === 'tsundere' && <Flame className="w-3.5 h-3.5 text-orange-400" />}
              {personality === 'kuudere' && <Cpu className="w-3.5 h-3.5 text-blue-400" />}
              {personality === 'dandere' && <Compass className="w-3.5 h-3.5 text-purple-400" />}
              {personality === 'deredere' && <Sparkles className="w-3.5 h-3.5 text-yellow-400" />}
              {personality === 'yandere' && <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />}
              Yuki • AI VTuber
            </span>
            {isTalking && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
            )}
          </div>
        </div>

        <p className="text-[10px] text-slate-400 font-mono mt-2 text-center max-w-[220px] min-h-[15px] italic">
          {isTalking ? '"Sedang berbicara..."' : isListening ? '"Mendengarkan Kakak..."' : '"Menunggu analisis keuangan berikutnya..."'}
        </p>

        {/* Action controls for voice */}
        <div className="flex items-center gap-2.5 mt-3 w-full justify-center">
          <button
            id="mic-speak-btn"
            onClick={onMicClick}
            className={`p-2 rounded-full transition-all flex items-center justify-center cursor-pointer ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
            }`}
            title={isListening ? 'Mulai Berbicara' : 'Bicara lewat Mic'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v4M8 23h8" />
            </svg>
          </button>

          <button
            id="toggle-voice-tts"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              voiceEnabled ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/40 shadow-md shadow-cyan-600/10' : 'bg-white/5 text-slate-400 border-white/10'
            }`}
            title={voiceEnabled ? 'Suara Aktif' : 'Suara Mati'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
