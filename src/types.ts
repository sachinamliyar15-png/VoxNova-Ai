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
  { id: 'sultan', name: 'SULTAN', gender: 'male', color: 'from-amber-900 to-orange-950', description: 'The Alpha Beast. Ultra-deep, heavy bass, commanding. Perfect for gym motivation and power speeches.', isPremium: true },
  { id: 'vikram', name: 'VIKRAM', gender: 'male', color: 'from-slate-800 to-zinc-900', description: 'The Dark Narrator. Mysterious, deep, smooth, and cinematic. Ideal for crime thrillers and horror stories.', isPremium: true },
  { id: 'bharat', name: 'BHARAT', gender: 'male', color: 'from-orange-600 to-red-800', description: 'The Grand Legend. Respectful, mature, heavy, and wise. Best for biographies and historical stories.', isPremium: true },
  { id: 'titan', name: 'TITAN', gender: 'male', color: 'from-red-900 to-black', description: 'The Motivational Monster. Aggressive, deep, and high energy. Raw and realistic gym-style voice.', isPremium: true },
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
