export interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female';
  previewUrl?: string;
  description: string;
  isPremium?: boolean;
}

export const VOICES: Voice[] = [
  { id: 'adam', name: 'Adam', gender: 'male', description: 'Deep, resonant, professional cinematic voice' },
  { id: 'brian', name: 'Brian', gender: 'male', description: 'Calm, steady, high-fidelity studio quality' },
  { id: 'daniel', name: 'Daniel', gender: 'male', description: 'Authoritative, clear, broadcast standard' },
  { id: 'josh', name: 'Josh', gender: 'male', description: 'Young, energetic, natural conversational tone' },
  { id: 'liam', name: 'Liam', gender: 'male', description: 'Warm, empathetic, realistic storytelling' },
  { id: 'michael', name: 'Michael', gender: 'male', description: 'Mature, wise, professional narration' },
  { id: 'ryan', name: 'Ryan', gender: 'male', description: 'Casual, conversational, relatable and authentic' },
  { id: 'matthew', name: 'Matthew', gender: 'male', description: 'Deep, cinematic, movie trailer quality' },
  { id: 'bill', name: 'Bill', gender: 'male', description: 'Gravelly, experienced, character-rich performance' },
  { id: 'callum', name: 'Callum', gender: 'male', description: 'Refined, polite, elite professional tone' },
  { id: 'frank', name: 'Frank', gender: 'male', description: 'Natural, balanced, clear professional narrator' },
  { id: 'marcus', name: 'Marcus', gender: 'male', description: 'Strong, motivational, commanding and inspiring' },
  { id: 'jessica', name: 'Jessica', gender: 'female', description: 'Clear, bright, modern corporate standard' },
  { id: 'sarah', name: 'Sarah', gender: 'female', description: 'Soft, soothing, ethereal and calm' },
  { id: 'matilda', name: 'Matilda', gender: 'female', description: 'Intelligent, articulate, academic precision' },
  { id: 'emily', name: 'Emily', gender: 'female', description: 'Youthful, cheerful, high-energy realism' },
  { id: 'bella', name: 'Bella', gender: 'female', description: 'Elegant, smooth, premium professional quality', isPremium: true },
  { id: 'rachel', name: 'Rachel', gender: 'female', description: 'Dynamic, expressive, versatile performance' },
  { id: 'nicole', name: 'Nicole', gender: 'female', description: 'Direct, confident, business standard' },
  { id: 'clara', name: 'Clara', gender: 'female', description: 'Kind, helpful, approachable realism' },
  { id: 'doc-pro', name: 'Documentary Pro', gender: 'male', description: 'Deep, cinematic, elite documentary narration', isPremium: true },
  { id: 'atlas-do', name: 'Atlas (Do)', gender: 'male', description: 'Ultra-high quality cinematic documentary voice' },
  { id: 'priyanka', name: 'Priyanka', gender: 'female', description: 'Powerful, deep, and authoritative female voice - perfect for professional documentaries' },
  { id: 'virat-male', name: 'Virat', gender: 'male', description: 'Realistic, high-energy, deep masculine voice. Thick, resonant, and commanding. Professional documentary standard.' },
];

export interface Generation {
  id: number;
  text: string;
  voice_name: string;
  style: string;
  speed: number;
  pitch: number;
  audio_data: string;
  created_at: string;
}
