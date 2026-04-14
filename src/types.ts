export interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female';
  previewUrl?: string;
  description: string;
  isPremium?: boolean;
  color: string;
  tags?: string[];
}

export const VOICES: Voice[] = [
  { id: 'adam', name: 'Adam', gender: 'male', color: 'from-blue-500 to-indigo-600', description: 'Deep, resonant, professional cinematic voice. Perfect for high-end commercials and movie trailers.' },
  { id: 'brian', name: 'Brian', gender: 'male', color: 'from-emerald-500 to-teal-600', description: 'Calm, steady, high-fidelity studio quality. Ideal for educational content and corporate presentations.' },
  { id: 'daniel', name: 'Daniel', gender: 'male', color: 'from-amber-500 to-orange-600', description: 'Authoritative, clear, broadcast standard. Excellent for news, announcements, and formal narration.' },
  { id: 'josh', name: 'Josh', gender: 'male', color: 'from-rose-500 to-pink-600', description: 'Young, energetic, natural conversational tone. Great for social media content and vlogs.' },
  { id: 'liam', name: 'Liam', gender: 'male', color: 'from-violet-500 to-purple-600', description: 'Warm, empathetic, realistic storytelling. Best for audiobooks and personal narratives.' },
  { id: 'michael', name: 'Michael', gender: 'male', color: 'from-slate-600 to-slate-800', description: 'Mature, wise, professional narration. Perfect for historical documentaries and deep storytelling.' },
  { id: 'ryan', name: 'Ryan', gender: 'male', color: 'from-cyan-500 to-blue-600', description: 'Casual, conversational, relatable and authentic. Sounds like a friend talking to you.' },
  { id: 'matthew', name: 'Matthew', gender: 'male', color: 'from-red-600 to-rose-800', description: 'Deep, cinematic, movie trailer quality. Intense and commanding presence.' },
  { id: 'bill', name: 'Bill', gender: 'male', color: 'from-stone-600 to-stone-800', description: 'Gravelly, experienced, character-rich performance. Ideal for unique characters and gritty narration.' },
  { id: 'callum', name: 'Callum', gender: 'male', color: 'from-indigo-400 to-blue-500', description: 'Refined, polite, elite professional tone. Sophisticated and clear delivery.' },
  { id: 'frank', name: 'Frank', gender: 'male', color: 'from-zinc-500 to-zinc-700', description: 'Natural, balanced, clear professional narrator. Versatile for any long-form content.' },
  { id: 'marcus', name: 'Marcus', gender: 'male', color: 'from-orange-600 to-red-700', description: 'Strong, motivational, commanding and inspiring. Perfect for fitness and leadership content.' },
  { id: 'jessica', name: 'Jessica', gender: 'female', color: 'from-pink-400 to-rose-500', description: 'Clear, bright, modern corporate standard. Professional and approachable.' },
  { id: 'sarah', name: 'Sarah', gender: 'female', color: 'from-teal-300 to-emerald-400', description: 'Soft, soothing, ethereal and calm. Perfect for meditation and relaxation content.' },
  { id: 'matilda', name: 'Matilda', gender: 'female', color: 'from-indigo-600 to-violet-700', description: 'Intelligent, articulate, academic precision. Great for technical and scientific explanations.' },
  { id: 'emily', name: 'Emily', gender: 'female', color: 'from-yellow-400 to-orange-500', description: 'Youthful, cheerful, high-energy realism. Ideal for children\'s content and upbeat ads.' },
  { id: 'bella', name: 'Bella', gender: 'female', color: 'from-purple-600 to-fuchsia-700', description: 'Elegant, smooth, premium professional quality. Sophisticated and rich texture.', isPremium: true },
  { id: 'rachel', name: 'Rachel', gender: 'female', color: 'from-red-400 to-pink-500', description: 'Dynamic, expressive, versatile performance. Wide emotional range for storytelling.' },
  { id: 'nicole', name: 'Nicole', gender: 'female', color: 'from-blue-700 to-indigo-900', description: 'Direct, confident, business standard. Firm and professional delivery.' },
  { id: 'clara', name: 'Clara', gender: 'female', color: 'from-orange-300 to-amber-400', description: 'Kind, helpful, approachable realism. Warm and motherly tone.' },
  { id: 'doc-pro', name: 'Documentary Pro', gender: 'male', color: 'from-emerald-700 to-teal-900', description: 'Deep, cinematic, elite documentary narration. National Geographic style quality.', isPremium: true },
  { id: 'atlas-do', name: 'Atlas (Do)', gender: 'male', color: 'from-blue-900 to-slate-900', description: 'Ultra-high quality cinematic documentary voice. Deeply resonant and intelligent.' },
  { id: 'priyanka', name: 'Priyanka', gender: 'female', color: 'from-fuchsia-600 to-purple-800', description: 'Powerful, deep, and authoritative female voice - perfect for professional documentaries and high-end narration.' },
  { id: 'virat-male', name: 'Virat', gender: 'male', color: 'from-orange-500 to-red-600', description: 'Realistic, high-energy, deep masculine voice. Thick, resonant, and commanding. Professional documentary standard.' },
  { id: 'leo', name: 'Leo', gender: 'male', color: 'from-amber-600 to-yellow-700', description: 'Warm, friendly, and highly expressive. Great for children\'s stories and character-driven content.' },
  { id: 'sophia', name: 'Sophia', gender: 'female', color: 'from-rose-400 to-pink-600', description: 'Soft, intimate, and deeply emotional. Ideal for romantic narratives and heartfelt messages.' },
  { id: 'hugo', name: 'Hugo', gender: 'male', color: 'from-indigo-700 to-blue-900', description: 'Gravelly, intense, and full of character. Perfect for villains or gritty protagonists.' },
  { id: 'elara', name: 'Elara', gender: 'female', color: 'from-emerald-400 to-teal-500', description: 'Bright, energetic, and enthusiastic. Excellent for tutorials and high-energy marketing.' },
  { id: 'pankaj', name: 'Pankaj', gender: 'male', color: 'from-zinc-800 to-black', description: 'Ultra-deep, baritone, authoritative documentary voice. Serious, intense, and professional with a slight grit.', isPremium: true },
  { id: 'original', name: 'Original Voice', gender: 'male', color: 'from-zinc-400 to-zinc-600', description: 'Preserve the original character and tone of your voice while translating.' },
  { id: 'sultan', name: 'SULTAN', gender: 'male', color: 'from-amber-900 to-orange-950', description: 'The Warrior. Ultra-deep, heavy bass, commanding. Perfect for gym motivation and power speeches.', isPremium: true },
  { id: 'shera', name: 'SHERA', gender: 'male', color: 'from-red-700 to-orange-900', description: 'The Motivator. Aggressive, deep, and powerful. Raw testosterone-driven male voice.', isPremium: true },
  { id: 'kaal', name: 'KAAL', gender: 'male', color: 'from-slate-900 to-black', description: 'The Dark Voice. Mysterious, cinematic, and ultra-low frequency. Ideal for villains and documentaries.', isPremium: true },
  { id: 'bheem', name: 'BHEEM', gender: 'male', color: 'from-stone-800 to-stone-950', description: 'The Giant. Super-heavy baritone, larger-than-life resonance. Sounds like the ground is shaking.', isPremium: true },
  { id: 'sikandar', name: 'SIKANDAR', gender: 'male', color: 'from-blue-900 to-indigo-950', description: 'The Legend. Mature, wise, and incredibly powerful. Rich bass for professional and authoritative narration.', isPremium: true },
  { id: 'vikram', name: 'VIKRAM', gender: 'male', color: 'from-slate-800 to-zinc-900', description: 'The Dark Narrator. Mysterious, deep, smooth, and cinematic. Ideal for crime thrillers and horror stories.', isPremium: true },
  { id: 'veer', name: 'VEER', gender: 'male', color: 'from-orange-500 to-red-700', description: 'The Brave. High-energy, loud, and incredibly powerful. Perfect for energetic announcements and viral reels.' },
  { id: 'shakti', name: 'SHAKTI', gender: 'female', color: 'from-rose-500 to-red-600', description: 'The Power. Strong, authoritative, and commanding female voice. Ideal for leadership and motivational content.' },
  { id: 'raja', name: 'RAJA', gender: 'male', color: 'from-yellow-500 to-amber-700', description: 'The Royal. Deep, resonant, and highly professional. Sounds like a king delivering a message.' },
  { id: 'toofan', name: 'TOOFAN', gender: 'male', color: 'from-blue-400 to-indigo-600', description: 'The Storm. Fast-paced, energetic, and loud. Great for high-intensity sports and action content.' },
  { id: 'bhairav', name: 'BHAIRAV', gender: 'male', color: 'from-zinc-700 to-zinc-900', description: 'The Intense. Deep, gritty, and incredibly powerful. Perfect for serious and impactful narration.' },
  {
    id: 'munna-bhai',
    name: 'Munna Bhai',
    gender: 'male',
    color: 'from-black via-red-700 to-orange-600',
    description: 'Ultra-heavy, powerful, deep baritone desi voice with explosive energy and commanding presence. Loud, aggressive, and highly impactful delivery that feels like a fearless leader speaking directly to you. Perfect for extreme motivation, warrior mindset, and high-intensity storytelling.',
    isPremium: true
  },
  {
    id: 'sachinboy',
    name: 'Sachinboy',
    gender: 'male',
    color: 'from-black via-red-900 to-red-600',
    description: 'The undisputed heavyweight champion of AI voices. A monstrous, chest-rattling deep baritone with explosive, fearless energy. It delivers words like a thunderclap—loud, aggressive, and incredibly professional. Perfect for hardcore motivation, dark documentaries, and raw warrior mindset content.',
    isPremium: true
  },
  {
    id: 'emperor-pro',
    name: 'EMPEROR PRO',
    gender: 'male',
    color: 'from-yellow-600 via-amber-700 to-yellow-900',
    description: 'The King of all voices. The most powerful, authoritative, and legendary deep baritone ever created. It commands absolute respect and attention. Perfect for royal narrations, epic storytelling, and the most impactful videos.',
    isPremium: true
  },
  {
    id: 'kabir',
    name: 'KABIR',
    gender: 'male',
    color: 'from-orange-700 to-amber-900',
    description: 'The Storyteller. A warm, wise, and deeply resonant voice. Perfect for historical narratives, audiobooks, and soulful storytelling.',
    isPremium: true
  },
  {
    id: 'aryan',
    name: 'ARYAN',
    gender: 'male',
    color: 'from-blue-600 to-cyan-800',
    description: 'The Fitness Coach. High-energy, sharp, and commanding. Designed for gym motivation, sports commentary, and high-intensity content.',
    isPremium: true
  },
  {
    id: 'ishani',
    name: 'ISHANI',
    gender: 'female',
    color: 'from-rose-600 to-pink-800',
    description: 'The Elegant Narrator. Smooth, sophisticated, and professional. Ideal for luxury brands, high-end documentaries, and corporate storytelling.',
    isPremium: true
  },
  {
    id: 'zoravar',
    name: 'ZORAVAR',
    gender: 'male',
    color: 'from-zinc-900 to-black',
    description: 'The Heavyweight. An ultra-deep, chest-rattling baritone with immense power. Perfect for intense movie trailers and dark narrations.',
    isPremium: true
  },
  {
    id: 'rudra',
    name: 'RUDRA',
    gender: 'male',
    color: 'from-red-900 to-black',
    description: 'The Intense Narrator. Gritty, serious, and highly authoritative. Best for crime thrillers, horror, and deep investigative content.',
    isPremium: true
  },
  {
    id: 'arav-neutral-pro',
    name: 'ARAV_NEUTRAL_PRO',
    gender: 'male',
    color: 'from-blue-400 via-indigo-500 to-blue-600',
    description: 'Natural Indian Male (25–35). Calm, confident, and grounded. Perfect for YouTube explanations and educational content.',
    isPremium: true,
    tags: ['Hindi', 'Professional', 'Calm']
  },
  {
    id: 'dev-deep-real',
    name: 'DEV_DEEP_REAL',
    gender: 'male',
    color: 'from-zinc-700 via-slate-800 to-zinc-900',
    description: 'Deep Mature Male (30–45). Stable, trustworthy, and authoritative. Ideal for serious documentaries and narration.',
    isPremium: true,
    tags: ['Hindi', 'Deep', 'Serious']
  },
  {
    id: 'neel-soft-connect',
    name: 'NEEL_SOFT_CONNECT',
    gender: 'male',
    color: 'from-emerald-400 via-teal-500 to-cyan-600',
    description: 'Warm Conversational Male (20–30). Friendly and relatable, like a friend explaining something. Best for vlogs and storytelling.',
    isPremium: true,
    tags: ['Hindi', 'Friendly', 'Warm']
  },
  {
    id: 'raj-classic-narrator',
    name: 'RAJ_CLASSIC_NARRATOR',
    gender: 'male',
    color: 'from-amber-700 via-orange-800 to-yellow-900',
    description: 'Classic Hindi Narrator. Clear, composed, and slightly formal. Perfect for epic storytelling and long-form content.',
    isPremium: true,
    tags: ['Hindi', 'Epic', 'Narrator']
  }
];

export const LANGUAGES = [
  { code: 'all', name: 'All Languages' },
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'mr', name: 'Marathi' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'ur', name: 'Urdu' },
  { code: 'kn', name: 'Kannada' },
  { code: 'or', name: 'Odia' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'it', name: 'Italian' },
  { code: 'ko', name: 'Korean' },
];

export interface Generation {
  id: string | number;
  type?: 'voice' | 'caption';
  text?: string;
  voice_name?: string;
  style?: any;
  speed?: number;
  pitch?: number;
  audio_data?: string;
  words?: any[];
  animation?: any;
  language?: string;
  timestamp?: any;
  created_at?: string;
}

export interface CaptionWord {
  word: string;
  start: number;
  end: number;
  isHighlighted?: boolean;
  highlightColor?: string;
  position?: 'top' | 'middle' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  color?: string;
  fontSize?: number;
}

export interface CaptionStyle {
  fontSize: number;
  color: string;
  glow?: boolean;
  border: 'none' | 'thin' | 'thick';
  font: string;
  position: 'top' | 'middle' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  backgroundColor?: string;
  outlineColor?: string;
  case: 'original' | 'uppercase' | 'lowercase';
  wordsPerLine: number;
  shadow?: boolean;
  shadowColor?: string;
  strokeWidth?: number;
  isDynamic?: boolean;
  threeColors?: string[];
  padding?: string;
  borderRadius?: string;
  letterSpacing?: string;
  italic?: boolean;
  fontWeight?: string;
  isSmart?: boolean;
  x?: number;
  y?: number;
}

export interface CaptionPreset {
  id: string;
  name: string;
  style: CaptionStyle;
  animation: string;
}
