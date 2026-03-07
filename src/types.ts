export interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female';
  previewUrl?: string;
  description: string;
}

export const VOICES: Voice[] = [
  { id: 'adam', name: 'Adam', gender: 'male', description: 'Deep, resonant, professional' },
  { id: 'brian', name: 'Brian', gender: 'male', description: 'Calm, steady, documentary style' },
  { id: 'daniel', name: 'Daniel', gender: 'male', description: 'Authoritative, clear, news-like' },
  { id: 'josh', name: 'Josh', gender: 'male', description: 'Young, energetic, friendly' },
  { id: 'liam', name: 'Liam', gender: 'male', description: 'Warm, empathetic, storytelling' },
  { id: 'michael', name: 'Michael', gender: 'male', description: 'Mature, wise, sophisticated' },
  { id: 'ryan', name: 'Ryan', gender: 'male', description: 'Casual, conversational, upbeat' },
  { id: 'matthew', name: 'Matthew', gender: 'male', description: 'Deep, cinematic, dramatic' },
  { id: 'bill', name: 'Bill', gender: 'male', description: 'Gravelly, experienced, rugged' },
  { id: 'callum', name: 'Callum', gender: 'male', description: 'British accent, refined, polite' },
  { id: 'frank', name: 'Frank', gender: 'male', description: 'Classic narrator, trustworthy' },
  { id: 'marcus', name: 'Marcus', gender: 'male', description: 'Strong, motivational, powerful' },
  { id: 'jessica', name: 'Jessica', gender: 'female', description: 'Clear, bright, professional' },
  { id: 'sarah', name: 'Sarah', gender: 'female', description: 'Soft, soothing, gentle' },
  { id: 'matilda', name: 'Matilda', gender: 'female', description: 'Intelligent, articulate, formal' },
  { id: 'emily', name: 'Emily', gender: 'female', description: 'Youthful, cheerful, friendly' },
  { id: 'bella', name: 'Bella', gender: 'female', description: 'Expressive, emotional, dramatic' },
  { id: 'rachel', name: 'Rachel', gender: 'female', description: 'Confident, modern, sleek' },
  { id: 'nicole', name: 'Nicole', gender: 'female', description: 'Warm, maternal, comforting' },
  { id: 'clara', name: 'Clara', gender: 'female', description: 'Elegant, sophisticated, smooth' },
  { id: 'doc-pro', name: 'Documentary Pro', gender: 'male', description: 'Deep, cinematic, professional documentary narration' },
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
