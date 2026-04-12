import { CaptionPreset } from '../types';

export const CAPTION_PRESETS: CaptionPreset[] = [
  {
    id: 'side-by-side',
    name: 'Side-by-Side',
    style: {
      fontSize: 64,
      color: '#ffffff',
      glow: false,
      border: 'thick',
      font: 'Inter',
      position: 'middle',
      backgroundColor: 'transparent',
      outlineColor: '#000000',
      case: 'uppercase',
      wordsPerLine: 2,
      shadow: true,
      shadowColor: '#000000',
      strokeWidth: 3,
      fontWeight: '900',
      isDynamic: true,
      threeColors: ['#ffffff', '#ffff00'],
      isSmart: true
    },
    animation: 'snappy-pop'
  },
  {
    id: 'viral-ai-smart',
    name: 'Viral AI Smart',
    style: {
      fontSize: 64,
      color: '#ffffff',
      glow: false,
      border: 'thick',
      font: 'Inter',
      position: 'middle',
      backgroundColor: 'transparent',
      outlineColor: '#000000',
      case: 'uppercase',
      wordsPerLine: 1,
      shadow: true,
      shadowColor: '#000000',
      strokeWidth: 3,
      fontWeight: '900',
      isDynamic: true,
      threeColors: ['#ffff00', '#ffffff', '#00ff00'],
      isSmart: true
    },
    animation: 'snappy-pop'
  },
  {
    id: 'hormozi-bold',
    name: 'Hormozi Bold',
    style: {
      fontSize: 72,
      color: '#ffff00',
      glow: false,
      border: 'thick',
      font: 'Inter',
      position: 'middle',
      backgroundColor: 'transparent',
      outlineColor: '#000000',
      case: 'uppercase',
      wordsPerLine: 1,
      shadow: true,
      shadowColor: '#000000',
      strokeWidth: 4,
      fontWeight: '900'
    },
    animation: 'pop'
  },
  {
    id: 'neon-storyteller',
    name: 'Neon Storyteller',
    style: {
      fontSize: 48,
      color: '#00ffff',
      glow: true,
      border: 'thin',
      font: 'Inter',
      position: 'middle',
      backgroundColor: 'transparent',
      outlineColor: '#000000',
      case: 'original',
      wordsPerLine: 1,
      shadow: true,
      shadowColor: 'rgba(0,255,255,0.5)',
      strokeWidth: 1,
      fontWeight: '600'
    },
    animation: 'glow'
  },
  {
    id: 'minimalist-pro',
    name: 'Minimalist Pro',
    style: {
      fontSize: 32,
      color: '#ffffff',
      glow: false,
      border: 'none',
      font: 'Inter',
      position: 'bottom',
      backgroundColor: 'transparent',
      case: 'original',
      wordsPerLine: 8,
      shadow: true,
      shadowColor: 'rgba(0,0,0,0.5)',
      strokeWidth: 0,
      fontWeight: '400',
      letterSpacing: '0.02em'
    },
    animation: 'fade'
  },
  {
    id: 'gaming-burst',
    name: 'Gaming Burst',
    style: {
      fontSize: 60,
      color: '#ff00ff',
      glow: true,
      border: 'thick',
      font: 'Inter',
      position: 'middle',
      backgroundColor: 'transparent',
      outlineColor: '#ffffff',
      case: 'uppercase',
      wordsPerLine: 1,
      shadow: true,
      shadowColor: '#000000',
      strokeWidth: 3,
      fontWeight: '900'
    },
    animation: 'snappy-pop'
  },
  {
    id: 'professional-viral',
    name: 'Professional Viral',
    style: {
      fontSize: 64,
      color: '#ffffff',
      glow: false,
      border: 'thick',
      font: 'Inter',
      position: 'middle',
      backgroundColor: 'transparent',
      outlineColor: '#000000',
      case: 'uppercase',
      wordsPerLine: 1,
      shadow: true,
      shadowColor: '#000000',
      strokeWidth: 4,
      fontWeight: '900',
      isDynamic: true
    },
    animation: 'professional'
  },
  {
    id: 'professional-three-color',
    name: 'Viral 3-Color',
    style: {
      fontSize: 64,
      color: '#ffffff',
      glow: false,
      border: 'thick',
      font: 'Inter',
      position: 'middle',
      backgroundColor: 'transparent',
      outlineColor: '#000000',
      case: 'uppercase',
      wordsPerLine: 1,
      shadow: true,
      shadowColor: '#000000',
      strokeWidth: 3,
      fontWeight: '900',
      isDynamic: true,
      threeColors: ['#ffff00', '#ffffff', '#00ff00']
    },
    animation: 'snappy-pop'
  },
  {
    id: 'viral-yellow-pro',
    name: 'Viral Yellow (Pro)',
    style: {
      fontSize: 64,
      color: '#ffff00',
      glow: false,
      border: 'thick',
      font: 'Inter',
      position: 'middle',
      backgroundColor: 'transparent',
      outlineColor: '#000000',
      case: 'uppercase',
      wordsPerLine: 1,
      shadow: true,
      shadowColor: '#000000',
      strokeWidth: 3,
      fontWeight: '900'
    },
    animation: 'snappy-pop'
  },
  {
    id: 'zeemo-pro',
    name: 'Zeemo Pro',
    style: {
      fontSize: 64,
      color: '#ffffff',
      glow: false,
      border: 'thick',
      font: 'Inter',
      position: 'middle',
      backgroundColor: 'transparent',
      outlineColor: '#000000',
      case: 'uppercase',
      wordsPerLine: 1,
      shadow: true,
      shadowColor: '#000000',
      strokeWidth: 3,
      letterSpacing: '0.05em',
      italic: true,
      fontWeight: '900'
    },
    animation: 'zeemo'
  },
  {
    id: 'kinetic-stacking',
    name: 'Kinetic Stacking',
    style: {
      fontSize: 48,
      color: '#ffffff',
      glow: false,
      border: 'none',
      font: 'Inter',
      position: 'middle',
      backgroundColor: 'transparent',
      case: 'uppercase',
      wordsPerLine: 4,
      shadow: true,
      shadowColor: 'rgba(0,0,0,0.5)',
      strokeWidth: 0,
      fontWeight: '900'
    },
    animation: 'kinetic'
  },
  {
    id: 'hindi-viral-yellow',
    name: 'Hindi Viral Yellow',
    style: {
      fontSize: 52,
      color: '#ffff00',
      glow: true,
      border: 'thick',
      font: 'Inter',
      position: 'middle',
      backgroundColor: 'transparent',
      outlineColor: '#000000',
      case: 'uppercase',
      wordsPerLine: 1,
      shadow: true,
      shadowColor: 'rgba(0,0,0,0.8)',
      strokeWidth: 2
    },
    animation: 'pop'
  },
  {
    id: 'hindi-neon-green',
    name: 'Hindi Neon Green',
    style: {
      fontSize: 48,
      color: '#00ff00',
      glow: true,
      border: 'thin',
      font: 'Inter',
      position: 'middle',
      backgroundColor: 'transparent',
      outlineColor: '#000000',
      case: 'uppercase',
      wordsPerLine: 1,
      shadow: true,
      shadowColor: 'rgba(0,0,0,0.5)',
      strokeWidth: 1
    },
    animation: 'glow'
  },
  {
    id: 'karaoke-blue',
    name: 'Karaoke Blue',
    style: {
      fontSize: 40,
      color: '#ffffff',
      glow: false,
      border: 'thick',
      font: 'Inter',
      position: 'bottom',
      backgroundColor: 'rgba(0,0,0,0.5)',
      outlineColor: '#3b82f6',
      case: 'original',
      wordsPerLine: 5,
      shadow: true,
      shadowColor: 'rgba(0,0,0,0.5)',
      strokeWidth: 2
    },
    animation: 'karaoke'
  },
  {
    id: 'typewriter-white',
    name: 'Typewriter White',
    style: {
      fontSize: 36,
      color: '#ffffff',
      glow: false,
      border: 'none',
      font: 'Courier New',
      position: 'bottom',
      backgroundColor: 'transparent',
      case: 'original',
      wordsPerLine: 8,
      shadow: true,
      shadowColor: 'rgba(0,0,0,0.8)',
      strokeWidth: 0
    },
    animation: 'typewriter'
  },
  {
    id: 'hindi-shadow-white',
    name: 'Hindi Shadow White',
    style: {
      fontSize: 50,
      color: '#ffffff',
      glow: false,
      border: 'none',
      font: 'Inter',
      position: 'middle',
      backgroundColor: 'transparent',
      outlineColor: '#000000',
      case: 'uppercase',
      wordsPerLine: 1,
      shadow: true,
      shadowColor: '#000000',
      strokeWidth: 0
    },
    animation: 'pop'
  },
  {
    id: 'hindi-gradient-cyan',
    name: 'Hindi Gradient Cyan',
    style: {
      fontSize: 46,
      color: '#00ffff',
      glow: true,
      border: 'thick',
      font: 'Inter',
      position: 'middle',
      backgroundColor: 'transparent',
      outlineColor: '#ff00ff',
      case: 'uppercase',
      wordsPerLine: 1,
      shadow: false,
      shadowColor: 'transparent',
      strokeWidth: 1.5
    },
    animation: 'pop'
  },
  {
    id: 'hindi-bold-red',
    name: 'Hindi Bold Red',
    style: {
      fontSize: 54,
      color: '#ff0000',
      glow: true,
      border: 'thick',
      font: 'Inter',
      position: 'middle',
      backgroundColor: 'transparent',
      outlineColor: '#ffffff',
      case: 'uppercase',
      wordsPerLine: 1,
      shadow: true,
      shadowColor: 'rgba(255,0,0,0.4)',
      strokeWidth: 3
    },
    animation: 'pop'
  },
  {
    id: 'hindi-royal-gold',
    name: 'Hindi Royal Gold',
    style: {
      fontSize: 48,
      color: '#ffd700',
      glow: true,
      border: 'thick',
      font: 'Inter',
      position: 'middle',
      backgroundColor: 'transparent',
      outlineColor: '#000000',
      case: 'uppercase',
      wordsPerLine: 1,
      shadow: true,
      shadowColor: 'rgba(0,0,0,0.7)',
      strokeWidth: 2
    },
    animation: 'glow'
  },
  {
    id: 'hindi-soft-pink',
    name: 'Hindi Soft Pink',
    style: {
      fontSize: 44,
      color: '#ff69b4',
      glow: true,
      border: 'thin',
      font: 'Inter',
      position: 'middle',
      backgroundColor: 'transparent',
      outlineColor: '#000000',
      case: 'uppercase',
      wordsPerLine: 1,
      shadow: true,
      shadowColor: 'rgba(255,105,180,0.3)',
      strokeWidth: 2
    },
    animation: 'pop'
  },
  {
    id: 'hindi-classic-blue',
    name: 'Hindi Classic Blue',
    style: {
      fontSize: 46,
      color: '#1e90ff',
      glow: true,
      border: 'thick',
      font: 'Inter',
      position: 'middle',
      backgroundColor: 'transparent',
      outlineColor: '#ffffff',
      case: 'uppercase',
      wordsPerLine: 1,
      shadow: true,
      shadowColor: 'rgba(30,144,255,0.4)',
      strokeWidth: 2
    },
    animation: 'pop'
  }
];
