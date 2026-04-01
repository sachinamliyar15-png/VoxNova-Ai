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
  { id: 'sultan', name: 'SULTAN', gender: 'male', color: 'from-amber-900 to-orange-950', description: 'The Alpha Beast. Ultra-deep, heavy bass, commanding. Perfect for gym motivation and power speeches.', isPremium: true },
  { id: 'vikram', name: 'VIKRAM', gender: 'male', color: 'from-slate-800 to-zinc-900', description: 'The Dark Narrator. Mysterious, deep, smooth, and cinematic. Ideal for crime thrillers and horror stories.', isPremium: true },
  { id: 'bharat', name: 'BHARAT', gender: 'male', color: 'from-orange-600 to-red-800', description: 'The Grand Legend. Respectful, mature, heavy, and wise. Best for biographies and historical stories.', isPremium: true },
  { id: 'titan', name: 'TITAN', gender: 'male', color: 'from-red-900 to-black', description: 'The Motivational Monster. Aggressive, deep, and high energy. Raw and realistic gym-style voice.', isPremium: true },
  { id: 'pankaj', name: 'Pankaj', gender: 'male', color: 'from-zinc-800 to-black', description: 'Ultra-deep, baritone, authoritative documentary voice. Serious, intense, and professional with a slight grit.', isPremium: true },
  { id: 'doc-pro', name: 'Documentary Pro', gender: 'male', color: 'from-emerald-700 to-teal-900', description: 'Deep, cinematic, elite documentary narration. National Geographic style quality.', isPremium: true },
  { id: 'adam', name: 'Adam', gender: 'male', color: 'from-blue-500 to-indigo-600', description: 'Deep, resonant, professional cinematic voice. Perfect for high-end commercials and movie trailers.' },
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
