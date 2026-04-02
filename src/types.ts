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
  { id: 'original', name: 'Original Voice', gender: 'male', color: 'from-zinc-400 to-zinc-600', description: 'Preserve the original character and tone of your voice while translating.' },
  { id: 'sultan', name: 'SULTAN', gender: 'male', color: 'from-amber-900 to-orange-950', description: 'The Warrior. Ultra-deep, heavy bass, commanding. Perfect for gym motivation and power speeches.', isPremium: true },
  { id: 'shera', name: 'SHERA', gender: 'male', color: 'from-red-700 to-orange-900', description: 'The Motivator. Aggressive, deep, and powerful. Raw testosterone-driven male voice.', isPremium: true },
  { id: 'kaal', name: 'KAAL', gender: 'male', color: 'from-slate-900 to-black', description: 'The Dark Voice. Mysterious, cinematic, and ultra-low frequency. Ideal for villains and documentaries.', isPremium: true },
  { id: 'bheem', name: 'BHEEM', gender: 'male', color: 'from-stone-800 to-stone-950', description: 'The Giant. Super-heavy baritone, larger-than-life resonance. Sounds like the ground is shaking.', isPremium: true },
  { id: 'sikandar', name: 'SIKANDAR', gender: 'male', color: 'from-blue-900 to-indigo-950', description: 'The Legend. Mature, wise, and incredibly powerful. Rich bass for professional and authoritative narration.', isPremium: true },
  { id: 'vikram', name: 'VIKRAM', gender: 'male', color: 'from-slate-800 to-zinc-900', description: 'The Dark Narrator. Mysterious, deep, smooth, and cinematic. Ideal for crime thrillers and horror stories.', isPremium: true },
  { id: 'pankaj', name: 'Pankaj', gender: 'male', color: 'from-zinc-800 to-black', description: 'Ultra-deep, baritone, authoritative documentary voice. Serious, intense, and professional with a slight grit.', isPremium: true },
  { id: 'doc-pro', name: 'Documentary Pro', gender: 'male', color: 'from-emerald-700 to-teal-900', description: 'Deep, cinematic, elite documentary narration. National Geographic style quality.', isPremium: true },
  { id: 'adam', name: 'Adam', gender: 'male', color: 'from-blue-500 to-indigo-600', description: 'Deep, resonant, professional cinematic voice. Perfect for high-end commercials and movie trailers.' },
];

export const LANGUAGES = [
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
  style?: string;
  speed?: number;
  pitch?: number;
  audio_data?: string;
  words?: any[];
  language?: string;
  timestamp?: any;
  created_at?: string;
}
