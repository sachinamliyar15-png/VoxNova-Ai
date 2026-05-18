import React from 'react';
import { 
  Play, 
  Mic, 
  Zap, 
  Timer,
  Crown,
  Music
} from 'lucide-react';
import { motion } from 'motion/react';
import { Voice } from '../types';

const VOICE_PROFILES: Record<string, { resonance: string; energy: string; timber: string; pacing: string; description: string }> = {
  'Adam': { resonance: 'Frontal-Oral', energy: 'High', timber: 'Sharp', pacing: 'Normal', description: 'Deep, authoritative tone of a 45-year-old male leader. Resonant, commanding, and professional cinematic voice.' },
  'Brian': { resonance: 'Chest', energy: 'Calm', timber: 'Smooth', pacing: 'Slow', description: 'Kind, trustworthy 30-year-old male with a soft, steady cadence and a friendly neighborhood vibe.' },
  'Daniel': { resonance: 'Frontal-Oral', energy: 'High', timber: 'Sharp', pacing: 'Fast', description: 'Energetic news anchor, mid-30s. Crisp, fast-paced, highly articulate broadcast professional.' },
  'Josh': { resonance: 'Throat', energy: 'High', timber: 'Airy', pacing: 'Normal', description: 'Youthful, energetic 20-year-old male. Natural conversational tone with slight breathiness and upbeat delivery.' },
  'Liam': { resonance: 'Mixed', energy: 'Calm', timber: 'Airy', pacing: 'Slow', description: 'Soft-spoken storyteller, mid-20s. Warm, empathetic, and gentle with distinct emotional depth.' },
  'Michael': { resonance: 'Chest', energy: 'Calm', timber: 'Gravelly', pacing: 'Slow', description: 'Mature 60-year-old narrator. Wise, sophisticated, with a distinct gravelly texture in the lower range.' },
  'Ryan': { resonance: 'Mixed', energy: 'Medium', timber: 'Gravelly', pacing: 'Normal', description: 'Casual, relatable mid-30s male. Authentic "guy-next-door" with slight rasp and conversational inflections.' },
  'Matthew': { resonance: 'Chest', energy: 'High', timber: 'Smooth', pacing: 'Normal', description: 'Intense 40-year-old action trailer narrator. Cinematic, dramatic, and intensely resonant.' },
  'Bill': { resonance: 'Throat', energy: 'Medium', timber: 'Gravelly', pacing: 'Slow', description: 'Rugged 50-year-old farmer type. Experienced, husky, and character-rich performance with rough edges.' },
  'Callum': { resonance: 'Frontal-Oral', energy: 'Medium', timber: 'Sharp', pacing: 'Normal', description: 'Elite British-style professor. Refined, precise, and sophisticated academic delivery.' },
  'Frank': { resonance: 'Chest', energy: 'High', timber: 'Smooth', pacing: 'Normal', description: 'Ultra-deep 55-year-old masculine icon. Powerful chest-voice with maximum bass resonance and authority.' },
  'Marcus': { resonance: 'Chest', energy: 'High', timber: 'Gravelly', pacing: 'Normal', description: 'Strong, motivational army sergeant. Commanding, inspiring, loud, and impactful.' },
  'Jessica': { resonance: 'Frontal-Oral', energy: 'High', timber: 'Sharp', pacing: 'Normal', description: 'Clear, professional 30-year-old corporate leader. Confident, friendly smile in the voice, and extremely crisp.' },
  'Sarah': { resonance: 'Mixed', energy: 'Calm', timber: 'Airy', pacing: 'Slow', description: 'Ethereal, soft-spoken young female. Gentle, soothing, and very quiet with a dream-like quality.' },
  'Matilda': { resonance: 'Frontal-Oral', energy: 'Medium', timber: 'Sharp', pacing: 'Normal', description: 'Intelligent, articulate university student. Professional, focused, and academic with clear delivery.' },
  'Emily': { resonance: 'Mixed', energy: 'High', timber: 'Smooth', pacing: 'Fast', description: 'Youthful, bubbly 19-year-old girl. High-energy, cheerful, and friendly with rapid pacing.' },
  'Bella': { resonance: 'Throat', energy: 'Medium', timber: 'Smooth', pacing: 'Slow', description: 'Elegant, sophisticated 40-year-old businesswoman. Premium, rich texture with a calm presence.' },
  'Rachel': { resonance: 'Mixed', energy: 'High', timber: 'Sharp', pacing: 'Normal', description: 'Dynamic, wide-ranging female actor. Versatile, expressive, and clear with high emotional intelligence.' },
  'Nicole': { resonance: 'Frontal-Oral', energy: 'Medium', timber: 'Sharp', pacing: 'Normal', description: 'Direct, confident 35-year-old journalist. No-nonsense, firm tone with broadcast standard clarity.' },
  'Clara': { resonance: 'Chest', energy: 'Calm', timber: 'Smooth', pacing: 'Slow', description: 'Kind 45-year-old motherly figure. Approachable, warm, and natural with a nurturing tone.' },
  'Documentary Pro': { resonance: 'Chest', energy: 'Medium', timber: 'Smooth', pacing: 'Normal', description: 'The absolute summit of documentary narration. Deep, mature, cinematic, and profoundly intelligent.' },
  'Atlas (Do)': { resonance: 'Chest', energy: 'High', timber: 'Smooth', pacing: 'Slow', description: 'Ultra-high fidelity cinematic voice. Deeply resonant with a legendary storytelling aura.' },
  'Virat': { resonance: 'Chest', energy: 'High', timber: 'Gravelly', pacing: 'Normal', description: 'Realistic, high-energy Hindi-English mix professional. Masculine, thick, and commanding. Documentary standard.' },
  'Priyanka': { resonance: 'Chest', energy: 'Medium', timber: 'Smooth', pacing: 'Normal', description: 'Powerful 40-year-old authoritative female. Perfect for documentaries and high-stakes narration.' },
  'SULTAN': { resonance: 'Chest', energy: 'High', timber: 'Gravelly', pacing: 'Slow', description: 'The Warrior. Ancient king tone. Every word vibrates with massive bass resonance and vocal fry.' },
  'Munna Bhai': { resonance: 'Throat', energy: 'High', timber: 'Sharp', pacing: 'Normal', description: 'Massive baritone Desi voice. Street-smart, energetic, and explosive power.' },
  'Sachinboy': { resonance: 'Frontal-Oral', energy: 'High', timber: 'Sharp', pacing: 'Normal', description: 'Heavyweight sporting champion. Monstrous energy, chest-rattling baritone, and confidence.' },
  'SHERA': { resonance: 'Chest', energy: 'High', timber: 'Gravelly', pacing: 'Normal', description: 'Alpha Motivator. Raw, aggressive, testosterone-driven masculine power. Extremely realistic.' },
  'KAAL': { resonance: 'Throat', energy: 'Medium', timber: 'Gravelly', pacing: 'Slow', description: 'The Mystery Shadow. Dark, cinematic, ultra-low frequency with mysterious undertones. Villainous profile.' },
  'BHEEM': { resonance: 'Chest', energy: 'High', timber: 'Gravelly', pacing: 'Slow', description: 'The Mythical Giant. Super-heavy baritone. The ground shakes with every word. Deepest human limit.' },
  'SIKANDAR': { resonance: 'Chest', energy: 'High', timber: 'Smooth', pacing: 'Normal', description: 'The Legend. Mature, wise warrior king. Rich bass for professional and epic narrations.' },
  'VIKRAM': { resonance: 'Throat', energy: 'Medium', timber: 'Smooth', pacing: 'Normal', description: 'The Dark Master. Smooth, mysterious, and cinematic with a brooding intensity.' },
  'EMPEROR PRO': { resonance: 'Chest', energy: 'High', timber: 'Smooth', pacing: 'Slow', description: 'Absolute Sovereign. Legendary deep baritone with a regal and commanding presence.' },
  'KABIR': { resonance: 'Chest', energy: 'Medium', timber: 'Smooth', pacing: 'Slow', description: 'Warm Poet and Storyteller. Wise, resonant, and deeply soulful storytelling tone.' },
  'ARYAN': { resonance: 'Frontal-Oral', energy: 'High', timber: 'Sharp', pacing: 'Normal', description: 'Intense Fitness Coach. High-energy, sharp, commanding, and extremely loud.' },
  'ZORAVAR': { resonance: 'Chest', energy: 'High', timber: 'Gravelly', pacing: 'Slow', description: 'The Heavy Tank. Ultra-deep, chest-rattling baritone built for trailer impact.' },
  'RUDRA': { resonance: 'Chest', energy: 'High', timber: 'Smooth', pacing: 'Normal', description: 'The Fearless Narrator. Gritty, serious, and extremely authoritative. Pure masculine grit.' },
  'Leo': { resonance: 'Mixed', energy: 'High', timber: 'Sharp', pacing: 'Normal', description: 'Vibrant young male, early 20s. Energetic, expressive, and friendly conversationalist.' },
  'Sophia': { resonance: 'Frontal-Oral', energy: 'High', timber: 'Smooth', pacing: 'Normal', description: 'Intimate female storyteller. Deeply emotional, soft, and resonant narration.' },
  'Hugo': { resonance: 'Chest', energy: 'Medium', timber: 'Smooth', pacing: 'Slow', description: 'Gravelly character actor. Mid-50s male with intense personality and rich tone.' },
  'Elara': { resonance: 'Mixed', energy: 'Medium', timber: 'Airy', pacing: 'Normal', description: 'Enthusiastic female host. Bright, energetic, and highly engaging for modern content.' },
  'Pankaj': { resonance: 'Chest', energy: 'Medium', timber: 'Gravelly', pacing: 'Slow', description: 'Ultra-authoritative male baritone. 100% realistic masculine grit with authority.' },
  'ISHANI': { resonance: 'Frontal-Oral', energy: 'High', timber: 'Sharp', pacing: 'Normal', description: 'High-class female presenter. Elegant, sophisticated, and flawlessly professional.' },
  'VEER': { resonance: 'Chest', energy: 'High', timber: 'Gravelly', pacing: 'Normal', description: 'The Braveheart. High-energy, loud, and incredibly powerful warrior male.' },
  'SHAKTI': { resonance: 'Frontal-Oral', energy: 'High', timber: 'Sharp', pacing: 'Normal', description: 'Female Power Leader. Strong, authoritative, and inspiring leadership voice.' },
  'RAJA': { resonance: 'Chest', energy: 'High', timber: 'Smooth', pacing: 'Normal', description: 'The Royal Prince. Youthful but powerful. Deep, resonant, and prestigious male.' },
  'TOOFAN': { resonance: 'Throat', energy: 'High', timber: 'Sharp', pacing: 'Fast', description: 'The Storm. Extremely fast-paced, explosive energy, and rapid-fire delivery.' },
  'BHAIRAV': { resonance: 'Chest', energy: 'High', timber: 'Gravelly', pacing: 'Slow', description: 'The Intense Sage. Gritty, impactful, and serious professional narration.' },
  'ARAV_NEUTRAL_PRO': { resonance: 'Mixed', energy: 'Medium', timber: 'Smooth', pacing: 'Normal', description: 'Modern Indian Male. Balanced, confident, and grounded. Natural urban Hindi speaker.' },
  'DEV_DEEP_REAL': { resonance: 'Chest', energy: 'Medium', timber: 'Smooth', pacing: 'Slow', description: 'Deep Mature Indian Elder. Stable, trustworthy, and authoritative traditional Hindi voice.' },
  'NEEL_SOFT_CONNECT': { resonance: 'Mixed', energy: 'Medium', timber: 'Airy', pacing: 'Normal', description: 'Friendly Indian Friend. Warm, casual, and relatable with a soft Hindi-English touch.' },
  'RAJ_CLASSIC_NARRATOR': { resonance: 'Chest', energy: 'High', timber: 'Smooth', pacing: 'Normal', description: 'Epic Hindi Narrator. Clear, composed, and formal. Built for grand stories and historical accounts.' }
};

const ActiveVoiceProfile = ({ voice, onPlaySample }: { voice: Voice, onPlaySample: () => void }) => {
  const profile = VOICE_PROFILES[voice.name] || {
    resonance: 'Mixed',
    energy: 'Medium',
    timber: 'Smooth',
    pacing: 'Normal',
    description: voice.description
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-2xl shadow-zinc-200/50 relative overflow-hidden group mb-8"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-50 to-transparent rounded-full -mr-32 -mt-32 opacity-50 group-hover:scale-110 transition-transform duration-700" />
      
      <div className="relative flex flex-col md:flex-row gap-8 items-start">
        <div className="relative shrink-0">
          <div className={`w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-gradient-to-br ${voice.color} flex items-center justify-center font-display font-black text-5xl md:text-6xl text-white shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-105 overflow-hidden`}>
            <span>{voice.name[0]}</span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <Mic size={40} className="text-white opacity-20" />
            </div>
          </div>
          <div className={`absolute inset-0 bg-gradient-to-br ${voice.color} blur-2xl opacity-20 -z-0 scale-110`} />
          
          <button 
            onClick={onPlaySample}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white text-zinc-900 border border-zinc-100 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all z-20 flex items-center gap-2 whitespace-nowrap"
          >
            <Play size={12} className="fill-current" />
            Sample Audio
          </button>
        </div>

        <div className="flex-1 space-y-6 pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-3xl font-display font-black text-zinc-900 tracking-tight">{voice.name}</h3>
              {voice.isPremium && (
                <div className="px-3 py-1 bg-amber-50 text-amber-500 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border border-amber-100">
                  <Crown size={12} />
                  Elite
                </div>
              )}
            </div>
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.2em]">{voice.gender} • {voice.isCloned ? 'Custom Voice Print' : 'Neural Studio Model'}</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Resonance', value: profile.resonance, icon: Music },
              { label: 'Energy', value: profile.energy, icon: Zap },
              { label: 'Timber', value: profile.timber, icon: Mic },
              { label: 'Pacing', value: profile.pacing, icon: Timer }
            ].map((attr) => (
              <div key={attr.label} className="space-y-1.5 p-3 rounded-2xl bg-zinc-50 border border-zinc-100/50 group/attr hover:bg-white hover:shadow-lg transition-all border shadow-sm">
                <div className="flex items-center gap-2 text-zinc-400">
                   <attr.icon size={10} />
                   <span className="text-[9px] font-black uppercase tracking-widest">{attr.label}</span>
                </div>
                <p className="text-xs font-bold text-zinc-800">{attr.value}</p>
              </div>
            ))}
          </div>

          <p className="text-zinc-600 text-sm leading-relaxed font-medium bg-zinc-50/50 p-5 rounded-3xl border border-zinc-100/30">
            {profile.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ActiveVoiceProfile;
