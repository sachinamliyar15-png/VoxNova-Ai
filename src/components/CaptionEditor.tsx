import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { 
  Edit3, 
  Highlighter, 
  Trash2, 
  Plus, 
  X, 
  Check, 
  Palette, 
  AlignLeft, 
  Square, 
  Maximize2, 
  Languages, 
  Smile,
  LayoutGrid,
  Sparkles,
  Type as TypeIcon
} from 'lucide-react';
import { CaptionWord, CaptionStyle } from '../types';
import { CAPTION_PRESETS } from '../constants/captionPresets';
import { FONTS } from '../constants/fonts';

interface CaptionEditorProps {
  words: CaptionWord[];
  onUpdate: (words: CaptionWord[]) => void;
  style: CaptionStyle;
  onUpdateStyle: (style: CaptionStyle) => void;
  animation: string;
  onUpdateAnimation: (anim: string) => void;
}

const CAPTION_COLORS = [
  '#ffffff', '#000000', '#facc15', '#eab308', '#ca8a04', // Yellows
  '#4ade80', '#22c55e', '#16a34a', // Greens
  '#60a5fa', '#3b82f6', '#2563eb', // Blues
  '#f87171', '#ef4444', '#dc2626', // Reds
  '#c084fc', '#a855f7', '#9333ea', // Purples
  '#fb923c', '#f97316', '#ea580c', // Oranges
  '#2dd4bf', '#14b8a6', '#0d9488', // Teals
  '#f472b6', '#ec4899', '#db2777', // Pinks
  '#ff8c00', '#ff1493', '#7fff00', '#4169e1', '#8a2be2'  // Additional
];

const CaptionEditor: React.FC<CaptionEditorProps> = ({ 
  words, 
  onUpdate,
  style,
  onUpdateStyle,
  animation,
  onUpdateAnimation
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'presets' | 'style' | 'animation' | 'layout' | 'edit'>('presets');
  const [activeStyleSubTab, setActiveStyleSubTab] = useState<'font' | 'color' | 'stroke' | 'shadow'>('font');
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const deleteWord = (idx: number) => {
    const newWords = [...words];
    newWords.splice(idx, 1);
    onUpdate(newWords);
  };

  const adjustTime = (idx: number, field: 'start' | 'end', delta: number) => {
    const newWords = [...words];
    newWords[idx][field] = Math.max(0, newWords[idx][field] + delta);
    onUpdate(newWords);
  };

  const insertWord = (idx: number) => {
    const newWords = [...words];
    const prevWord = words[idx];
    const nextWord = words[idx + 1];
    
    const newStart = prevWord.end + 0.1;
    const newEnd = nextWord ? Math.min(nextWord.start - 0.1, newStart + 0.5) : newStart + 0.5;
    
    newWords.splice(idx + 1, 0, {
      word: 'New',
      start: newStart,
      end: newEnd
    });
    onUpdate(newWords);
  };

  const handleBulkUpdate = () => {
    const newWordsText = bulkText.split(/\s+/).filter(w => w.length > 0);
    if (newWordsText.length === 0) return;

    const newWords: CaptionWord[] = newWordsText.map((text, i) => {
      if (i < words.length) {
        return { ...words[i], word: text };
      } else {
        const lastWord = i > 0 ? words[i-1] : words[words.length - 1];
        const start = lastWord ? lastWord.end + 0.1 : i * 0.5;
        return { word: text, start, end: start + 0.4 };
      }
    });
    onUpdate(newWords);
    setIsBulkEditing(false);
  };

  const toggleHighlight = (idx: number) => {
    const newWords = [...words];
    newWords[idx].isHighlighted = !newWords[idx].isHighlighted;
    if (!newWords[idx].isHighlighted) {
      delete newWords[idx].highlightColor;
    } else {
      newWords[idx].highlightColor = style.threeColors?.[0] || '#facc15';
    }
    onUpdate(newWords);
  };

  const setHighlightColor = (idx: number, color: string) => {
    const newWords = [...words];
    newWords[idx].highlightColor = color;
    onUpdate(newWords);
  };

  const updateStyle = (updates: Partial<CaptionStyle>) => {
    onUpdateStyle({ ...style, ...updates });
  };

  const renderEditTab = () => (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between px-2">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Word Timeline</span>
        <button 
          onClick={() => {
            if (!isBulkEditing) setBulkText(words.map(w => w.word).join(' '));
            setIsBulkEditing(!isBulkEditing);
          }}
          className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg transition-all"
        >
          {isBulkEditing ? <X size={12} /> : <Edit3 size={12} />}
          {isBulkEditing ? 'Cancel' : 'Bulk Edit'}
        </button>
      </div>

      {isBulkEditing ? (
        <div className="space-y-3">
          <textarea 
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            className="w-full h-48 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 custom-scrollbar"
            placeholder="Enter all words separated by spaces..."
          />
          <button 
            onClick={handleBulkUpdate}
            className="w-full py-3 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10"
          >
            Apply Changes
          </button>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {words.map((word, idx) => (
            <React.Fragment key={`caption-word-fragment-${word.word}-${word.start}-${idx}`}>
              <div className="flex flex-col gap-2 bg-zinc-50 p-3 rounded-2xl border border-zinc-100 group transition-all hover:border-emerald-200">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0">
                    {idx + 1}
                  </div>
                  <input 
                    type="text" 
                    value={word.word} 
                    onChange={(e) => {
                      const newWords = [...words];
                      newWords[idx].word = e.target.value;
                      onUpdate(newWords);
                    }}
                    className="flex-1 bg-transparent text-sm font-bold focus:outline-none text-zinc-900"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleHighlight(idx)}
                      className={`p-2 rounded-lg transition-all ${word.isHighlighted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-100 text-zinc-400 hover:text-zinc-600'}`}
                      title="Highlight Word"
                    >
                      <Highlighter size={14} />
                    </button>
                    <button 
                      onClick={() => deleteWord(idx)}
                      className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono bg-white px-2 py-1 rounded-lg border border-zinc-100">
                        <button onClick={() => adjustTime(idx, 'start', -0.1)} className="hover:text-zinc-900">«</button>
                        <span className="w-12 text-center">{word.start.toFixed(2)}s</span>
                        <button onClick={() => adjustTime(idx, 'start', 0.1)} className="hover:text-zinc-900">»</button>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono bg-white px-2 py-1 rounded-lg border border-zinc-100">
                        <button onClick={() => adjustTime(idx, 'end', -0.1)} className="hover:text-zinc-900">«</button>
                        <span className="w-12 text-center">{word.end.toFixed(2)}s</span>
                        <button onClick={() => adjustTime(idx, 'end', 0.1)} className="hover:text-zinc-900">»</button>
                      </div>
                    </div>
                    
                    <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden relative">
                      <div 
                        className="absolute h-full bg-emerald-500/40 rounded-full"
                        style={{ 
                          left: `${(word.start / (words[words.length-1].end || 1)) * 100}%`,
                          width: `${((word.end - word.start) / (words[words.length-1].end || 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 ml-4">
                    {word.isHighlighted && (
                      <div className="flex items-center gap-1.5">
                        {(style.threeColors || ['#facc15', '#4ade80', '#60a5fa', '#f87171', '#c084fc']).map((color, cIdx) => (
                          <button
                            key={`highlight-color-${idx}-${color}-${cIdx}`}
                            onClick={() => setHighlightColor(idx, color)}
                            className={`w-4 h-4 rounded-full border-2 transition-all ${word.highlightColor === color ? 'border-zinc-900 scale-125' : 'border-transparent hover:scale-110'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center -my-1 opacity-100 sm:opacity-0 sm:hover:opacity-100 transition-all">
                <button 
                  onClick={() => insertWord(idx)}
                  className="bg-emerald-500 text-white p-1.5 rounded-full shadow-lg hover:scale-125 transition-all z-10"
                  title="Insert Word"
                >
                  <Plus size={14} />
                </button>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );

  const renderPresetsTab = () => (
    <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-300 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      {CAPTION_PRESETS.map((preset) => (
        <motion.button
          key={preset.id}
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            onUpdateStyle(preset.style);
            onUpdateAnimation(preset.animation);
          }}
          className={`relative group p-4 rounded-2xl border-2 transition-all overflow-hidden ${style.font === preset.style.font && animation === preset.animation ? 'border-emerald-500 bg-emerald-50/30' : 'border-zinc-100 bg-white hover:border-zinc-200'}`}
        >
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div 
              className="text-base font-bold text-center leading-tight truncate w-full"
              style={{ 
                fontFamily: preset.style.font,
                color: preset.style.color,
                textShadow: preset.style.shadow ? `2px 2px 0px ${preset.style.shadowColor || '#000000'}` : 'none',
                WebkitTextStroke: preset.style.border !== 'none' ? `${Math.min(preset.style.strokeWidth || 1, 1.5)}px ${preset.style.outlineColor || '#000000'}` : 'none',
                paintOrder: 'stroke fill',
                WebkitPaintOrder: 'stroke fill',
                textTransform: preset.style.case === 'uppercase' ? 'uppercase' : 'none'
              } as any}
            >
              {preset.name}
            </div>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{preset.name}</span>
          </div>
          {style.font === preset.style.font && animation === preset.animation && (
            <div className="absolute top-2 right-2 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center">
              <Check size={8} className="text-white" />
            </div>
          )}
        </motion.button>
      ))}
    </div>
  );

  const renderStyleTab = () => (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
        {[
          { id: 'font', label: 'Font' },
          { id: 'color', label: 'Inner Color' },
          { id: 'stroke', label: 'Stroke Color' },
          { id: 'shadow', label: 'Shadow Color' }
        ].map(sub => (
          <button
            key={sub.id}
            onClick={() => setActiveStyleSubTab(sub.id as any)}
            className={`flex-1 min-w-[80px] py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeStyleSubTab === sub.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            {sub.label}
          </button>
        ))}
      </div>

      <div className="min-h-[250px]">
        {activeStyleSubTab === 'font' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Style Font (Weight & Tilt)</label>
              <div className="flex gap-2">
                 <button 
                   onClick={() => updateStyle({ italic: !style.italic })}
                   className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${style.italic ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'bg-white border-zinc-100 text-zinc-500'}`}
                 >
                   Italic Style
                 </button>
                 <button 
                   onClick={() => updateStyle({ fontWeight: style.fontWeight === '900' ? '400' : '900' })}
                   className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${style.fontWeight === '900' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'bg-white border-zinc-100 text-zinc-500'}`}
                 >
                   {style.fontWeight === '900' ? 'Ultra Bold' : 'Regular Text'}
                 </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Font Size</span>
                <span className="text-xs font-bold text-emerald-600">{style.fontSize}px</span>
              </div>
              <input 
                type="range" min="12" max="160" step="1"
                value={style.fontSize}
                onChange={(e) => updateStyle({ fontSize: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-zinc-100 rounded-full appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Handwriting Style</label>
              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                {FONTS.map(f => (
                  <button
                    key={f}
                    onClick={() => updateStyle({ font: f })}
                    className={`p-3 rounded-xl border-2 text-[10px] font-black transition-all hover:scale-[1.02] active:scale-[0.98] ${style.font === f ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md' : 'border-zinc-100 bg-white hover:border-zinc-200 text-zinc-500'}`}
                    style={{ fontFamily: f }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeStyleSubTab === 'color' && (
          <div className="space-y-4">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Choose Text Color</span>
            <div className="grid grid-cols-5 gap-2.5 p-3.5 bg-zinc-50 rounded-2xl border border-zinc-100 shadow-inner">
              {CAPTION_COLORS.map(c => (
                <button
                  key={`inner-${c}`}
                  onClick={() => updateStyle({ color: c })}
                  className={`w-full aspect-square rounded-full border-2 transition-all relative group ${style.color === c ? 'border-zinc-900 scale-110 shadow-md ring-2 ring-emerald-100' : 'border-white hover:scale-105 shadow-sm'}`}
                  style={{ backgroundColor: c }}
                >
                  {style.color === c && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check size={12} className={c === '#ffffff' ? 'text-zinc-900' : 'text-white'} strokeWidth={4} />
                    </div>
                  )}
                </button>
              ))}
              <div className="relative w-full aspect-square rounded-full overflow-hidden border-2 border-white shadow-sm group">
                <input 
                  type="color" 
                  value={style.color}
                  onChange={(e) => updateStyle({ color: e.target.value })}
                  className="absolute inset-0 w-full h-full scale-150 cursor-pointer opacity-0 z-10"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-white group-hover:bg-zinc-50 transition-colors">
                  <Plus size={14} className="text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                </div>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-zinc-100">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Smart Dynamic Highlights</span>
              <div className="flex gap-4 p-2 bg-white rounded-xl border border-zinc-50">
                {[0, 1, 2].map(i => (
                  <div key={`three-color-container-${i}`} className="space-y-2 flex flex-col items-center">
                    <div className="relative group">
                      <input 
                        type="color" 
                        value={style.threeColors?.[i] || '#ffffff'}
                        onChange={(e) => {
                          const newColors = [...(style.threeColors || ['#ffffff', '#ffff00', '#00ff00'])];
                          newColors[i] = e.target.value;
                          updateStyle({ threeColors: newColors });
                        }}
                        className="w-12 h-12 rounded-2xl cursor-pointer border-2 border-zinc-100 p-0.5 bg-white shadow-md hover:border-emerald-400 hover:scale-110 transition-all z-10 relative"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold z-20 shadow-sm">
                        {i + 1}
                      </div>
                    </div>
                    <span className="text-[8px] font-bold text-zinc-400 uppercase">C{i+1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeStyleSubTab === 'stroke' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Stroke Width</span>
                <span className="text-xs font-bold text-emerald-600">{style.strokeWidth || 0}px</span>
              </div>
              <input 
                type="range" min="0" max="20" step="0.5"
                value={style.strokeWidth || 0}
                onChange={(e) => updateStyle({ strokeWidth: parseFloat(e.target.value), border: parseFloat(e.target.value) > 0 ? 'thin' : 'none' })}
                className="w-full h-1.5 bg-zinc-100 rounded-full appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
            
            <div className="space-y-3">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Stroke Color (Outline)</span>
              <div className="grid grid-cols-5 gap-2.5 p-3.5 bg-zinc-50 rounded-2xl border border-zinc-100 shadow-inner">
                {CAPTION_COLORS.map(c => (
                  <button
                    key={`stroke-${c}`}
                    onClick={() => updateStyle({ outlineColor: c })}
                    className={`w-full aspect-square rounded-full border-2 transition-all relative group ${style.outlineColor === c ? 'border-zinc-900 scale-110 shadow-md ring-2 ring-emerald-100' : 'border-white hover:scale-105 shadow-sm'}`}
                    style={{ backgroundColor: c }}
                  >
                    {style.outlineColor === c && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check size={12} className={c === '#ffffff' ? 'text-zinc-900' : 'text-white'} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                ))}
                <div className="relative w-full aspect-square rounded-full overflow-hidden border-2 border-white shadow-sm group">
                  <input 
                    type="color" 
                    value={style.outlineColor || '#000000'}
                    onChange={(e) => updateStyle({ outlineColor: e.target.value })}
                    className="absolute inset-0 w-full h-full scale-150 cursor-pointer opacity-0 z-10"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-white group-hover:bg-zinc-50 transition-colors">
                    <Plus size={14} className="text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeStyleSubTab === 'shadow' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-zinc-950 rounded-[2rem] border border-zinc-800 shadow-xl">
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-white">Enable Drop Shadow</span>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Cinema Grade Depth</p>
              </div>
              <button 
                onClick={() => updateStyle({ shadow: !style.shadow })}
                className={`w-14 h-7 rounded-full transition-all relative ${style.shadow ? 'bg-emerald-500' : 'bg-zinc-800'}`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${style.shadow ? 'left-8' : 'left-1'}`} />
              </button>
            </div>
            
            {style.shadow && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Shadow Tint Color</span>
                  <div className="grid grid-cols-5 gap-2.5 p-3.5 bg-zinc-50 rounded-2xl border border-zinc-100 shadow-inner">
                    {CAPTION_COLORS.map(c => (
                      <button
                        key={`shadow-${c}`}
                        onClick={() => updateStyle({ shadowColor: c })}
                        className={`w-full aspect-square rounded-full border-2 transition-all relative group ${style.shadowColor === c ? 'border-zinc-900 scale-110 shadow-md ring-2 ring-emerald-100' : 'border-white hover:scale-105 shadow-sm'}`}
                        style={{ backgroundColor: c }}
                      >
                        {style.shadowColor === c && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check size={12} className={c === '#ffffff' ? 'text-zinc-900' : 'text-white'} strokeWidth={4} />
                          </div>
                        )}
                      </button>
                    ))}
                    <div className="relative w-full aspect-square rounded-full overflow-hidden border-2 border-white shadow-sm group">
                      <input 
                        type="color" 
                        value={style.shadowColor || '#000000'}
                        onChange={(e) => updateStyle({ shadowColor: e.target.value })}
                        className="absolute inset-0 w-full h-full scale-150 cursor-pointer opacity-0 z-10"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-white group-hover:bg-zinc-50 transition-colors">
                        <Plus size={14} className="text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderAnimationTab = () => (
    <div className="grid grid-cols-2 gap-2 animate-in fade-in duration-300">
      {[
        { id: 'pop', label: 'Pop Up' },
        { id: 'glow', label: 'Glow' },
        { id: 'snappy-pop', label: 'Snappy Pop' },
        { id: 'fade', label: 'Fade' },
        { id: 'professional', label: 'Professional' },
        { id: 'zeemo', label: 'Zeemo' },
        { id: 'kinetic', label: 'Kinetic' },
        { id: 'karaoke', label: 'Karaoke' }
      ].map(anim => (
        <button
          key={anim.id}
          onClick={() => onUpdateAnimation(anim.id)}
          className={`p-3 rounded-xl border-2 text-xs font-bold transition-all ${animation === anim.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-zinc-100 bg-white hover:border-zinc-200 text-zinc-500'}`}
        >
          {anim.label}
        </button>
      ))}
    </div>
  );

  const renderLayoutTab = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-3">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Position</span>
        <div className="grid grid-cols-3 gap-2">
          {['top', 'middle', 'bottom'].map(pos => (
            <button
              key={pos}
              onClick={() => updateStyle({ position: pos as any })}
              className={`py-2 rounded-xl border-2 text-[10px] font-bold uppercase transition-all ${style.position === pos ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-zinc-100 bg-white hover:border-zinc-200 text-zinc-500'}`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Smart Mode</span>
            <p className="text-[10px] text-zinc-500">Auto-animation & dynamic grouping</p>
          </div>
          <button 
            onClick={() => updateStyle({ isSmart: !style.isSmart })}
            className={`w-10 h-5 rounded-full transition-all relative ${style.isSmart ? 'bg-emerald-500' : 'bg-zinc-200'}`}
          >
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${style.isSmart ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Case Style</span>
        <div className="flex gap-2">
          {[
            { id: 'original', label: 'Aa' },
            { id: 'uppercase', label: 'AA' },
            { id: 'lowercase', label: 'aa' }
          ].map(c => (
            <button
              key={c.id}
              onClick={() => updateStyle({ case: c.id as any })}
              className={`flex-1 py-2 rounded-xl border-2 text-xs font-bold transition-all ${style.case === c.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-zinc-100 bg-white hover:border-zinc-200 text-zinc-500'}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Words Per Line</span>
          <span className="text-xs font-bold text-zinc-900">{style.wordsPerLine}</span>
        </div>
        <input 
          type="range" min="1" max="10"
          value={style.wordsPerLine}
          onChange={(e) => updateStyle({ wordsPerLine: parseInt(e.target.value) })}
          className="w-full h-1.5 bg-zinc-100 rounded-full appearance-none cursor-pointer accent-emerald-500"
        />
      </div>

      <div className="pt-4 border-t border-zinc-100">
        <button
          onClick={() => updateStyle({ x: 0, y: 0 })}
          className="w-full py-3 bg-zinc-100 text-zinc-600 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
        >
          <X size={14} />
          Reset Custom Position
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-t-[2.5rem] overflow-hidden border-t border-zinc-200 shadow-2xl animate-in slide-in-from-bottom-10">
      {/* Tab Navigation */}
      <div className="bg-zinc-50/50 border-b border-zinc-100 p-2 flex items-center justify-around">
        {[
          { id: 'presets', label: 'Presets', icon: LayoutGrid },
          { id: 'style', label: 'Style', icon: Palette },
          { id: 'animation', label: 'Animation', icon: Sparkles },
          { id: 'layout', label: 'Layout', icon: Maximize2 },
          { id: 'edit', label: 'Edit', icon: Edit3 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveMainTab(tab.id as any)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${activeMainTab === tab.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            <tab.icon size={18} />
            <span className="text-[9px] font-bold uppercase tracking-tight">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar min-h-[350px]">
        {activeMainTab === 'presets' && renderPresetsTab()}
        {activeMainTab === 'style' && renderStyleTab()}
        {activeMainTab === 'animation' && renderAnimationTab()}
        {activeMainTab === 'layout' && renderLayoutTab()}
        {activeMainTab === 'edit' && renderEditTab()}
      </div>
    </div>
  );
};

export default CaptionEditor;
