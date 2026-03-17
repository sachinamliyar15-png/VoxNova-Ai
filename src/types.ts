export interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female';
  previewUrl?: string;
  description: string;
  isPremium?: boolean;
}

export const VOICES: Voice[] = [
  { id: 'adam', name: 'Adam', gender: 'male', description: 'Deep, resonant, professional cinematic voice. Perfect for high-end commercials and movie trailers.' },
  { id: 'brian', name: 'Brian', gender: 'male', description: 'Calm, steady, high-fidelity studio quality. Ideal for educational content and corporate presentations.' },
  { id: 'daniel', name: 'Daniel', gender: 'male', description: 'Authoritative, clear, broadcast standard. Excellent for news, announcements, and formal narration.' },
  { id: 'josh', name: 'Josh', gender: 'male', description: 'Young, energetic, natural conversational tone. Great for social media content and vlogs.' },
  { id: 'liam', name: 'Liam', gender: 'male', description: 'Warm, empathetic, realistic storytelling. Best for audiobooks and personal narratives.' },
  { id: 'michael', name: 'Michael', gender: 'male', description: 'Mature, wise, professional narration. Perfect for historical documentaries and deep storytelling.' },
  { id: 'ryan', name: 'Ryan', gender: 'male', description: 'Casual, conversational, relatable and authentic. Sounds like a friend talking to you.' },
  { id: 'matthew', name: 'Matthew', gender: 'male', description: 'Deep, cinematic, movie trailer quality. Intense and commanding presence.' },
  { id: 'bill', name: 'Bill', gender: 'male', description: 'Gravelly, experienced, character-rich performance. Ideal for unique characters and gritty narration.' },
  { id: 'callum', name: 'Callum', gender: 'male', description: 'Refined, polite, elite professional tone. Sophisticated and clear delivery.' },
  { id: 'frank', name: 'Frank', gender: 'male', description: 'Natural, balanced, clear professional narrator. Versatile for any long-form content.' },
  { id: 'marcus', name: 'Marcus', gender: 'male', description: 'Strong, motivational, commanding and inspiring. Perfect for fitness and leadership content.' },
  { id: 'jessica', name: 'Jessica', gender: 'female', description: 'Clear, bright, modern corporate standard. Professional and approachable.' },
  { id: 'sarah', name: 'Sarah', gender: 'female', description: 'Soft, soothing, ethereal and calm. Perfect for meditation and relaxation content.' },
  { id: 'matilda', name: 'Matilda', gender: 'female', description: 'Intelligent, articulate, academic precision. Great for technical and scientific explanations.' },
  { id: 'emily', name: 'Emily', gender: 'female', description: 'Youthful, cheerful, high-energy realism. Ideal for children\'s content and upbeat ads.' },
  { id: 'bella', name: 'Bella', gender: 'female', description: 'Elegant, smooth, premium professional quality. Sophisticated and rich texture.', isPremium: true },
  { id: 'rachel', name: 'Rachel', gender: 'female', description: 'Dynamic, expressive, versatile performance. Wide emotional range for storytelling.' },
  { id: 'nicole', name: 'Nicole', gender: 'female', description: 'Direct, confident, business standard. Firm and professional delivery.' },
  { id: 'clara', name: 'Clara', gender: 'female', description: 'Kind, helpful, approachable realism. Warm and motherly tone.' },
  { id: 'doc-pro', name: 'Documentary Pro', gender: 'male', description: 'Deep, cinematic, elite documentary narration. National Geographic style quality.', isPremium: true },
  { id: 'atlas-do', name: 'Atlas (Do)', gender: 'male', description: 'Ultra-high quality cinematic documentary voice. Deeply resonant and intelligent.' },
  { id: 'priyanka', name: 'Priyanka', gender: 'female', description: 'Powerful, deep, and authoritative female voice - perfect for professional documentaries and high-end narration.' },
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
