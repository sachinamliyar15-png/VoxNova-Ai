import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CaptionWord, CaptionStyle } from '../types';
import { groupWordsIntoLines } from '../lib/captionUtils';

interface CaptionOverlayProps {
  words: CaptionWord[];
  currentTime: number;
  style: CaptionStyle;
  animation: string;
  shadowColor: string;
  isExporting?: boolean;
  onUpdateStyle?: (style: Partial<CaptionStyle>) => void;
}

const CaptionOverlay: React.FC<CaptionOverlayProps> = ({ 
  words, 
  currentTime, 
  style, 
  animation,
  shadowColor: propShadowColor,
  isExporting,
  onUpdateStyle
}) => {
  if (isExporting) return null;
  const adjustedTime = currentTime;

  const [isDragging, setIsDragging] = React.useState(false);
  const [guides, setGuides] = React.useState({ x: false, y: false });
  
  const displayWords = React.useMemo(() => groupWordsIntoLines(words, style.wordsPerLine, style.isSmart), [words, style.wordsPerLine, style.isSmart]);
  const currentWordIndex = displayWords.findIndex(w => adjustedTime >= (w.start - 0.1) && adjustedTime <= w.end);
  const currentWord = displayWords[currentWordIndex];
  
  const driftOffset = React.useMemo(() => {
    const isProStyle = animation === 'skate' || animation === 'pop' || animation === 'snappy-pop' || animation === 'professional';
    if (!style.isSmart || !isProStyle) return { x: 0, y: 0 };
    
    const seed = (currentWord?.start || 0) * 2; 
    const offsetX = Math.sin(seed) * 4; 
    const offsetY = Math.cos(seed) * 2;
    return { x: offsetX, y: offsetY };
  }, [animation, style.isSmart, currentWord?.start]);

  if (!currentWord) return null;

  const getDynamicColor = (index: number, word: CaptionWord) => {
    if (style.alternatingColors) {
      return (index % 2 === 0) ? (style.color1 || '#ffffff') : (style.color2 || '#ffff00');
    }
    if (style.isDynamic) {
      const colors = style.threeColors || ['#ffffff', '#ffff00', '#00ff1a'];
      const stableIndex = Math.floor((word.start * 10) % colors.length);
      return colors[stableIndex];
    }
    return style.color || '#ffffff';
  };

  const getAnimationProps = () => {
    const isPro = style.isSmart;
    switch (animation) {
      case 'typing':
      case 'typewriter':
        return {
          initial: { opacity: 0, x: -5, y: 5, scale: 0.8, rotate: -2 },
          animate: { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 },
          transition: { 
            duration: 0.04, 
            type: "spring" as const,
            stiffness: 2000,
            damping: 40,
            opacity: { duration: 0.03 },
            scale: { duration: 0.05 }
          }
        };
      case 'pop':
        return {
          initial: { scale: 0.5, opacity: 0, y: 20 },
          animate: { scale: [0.5, 1.2, 1], opacity: 1, y: 0 },
          transition: { duration: 0.2, times: [0, 0.6, 1], ease: "easeOut" as const }
        };
      case 'professional':
        return {
          initial: { scale: 0.8, opacity: 0, y: 10 },
          animate: { scale: [0.8, 1.05, 1], opacity: 1, y: 0 },
          transition: { 
            type: 'spring' as const, 
            stiffness: 1000, 
            damping: 30,
            restDelta: 0.001
          }
        };
      case 'snappy':
        return {
          initial: { scale: 0.7, opacity: 0, y: 10 },
          animate: { scale: [0.7, 1.25, 1], opacity: 1, y: 0 },
          transition: { 
            type: "spring" as const,
            stiffness: 1500,
            damping: 25,
            duration: 0.05
          }
        };
      case 'snappy-pop':
        return {
          initial: { scale: 0.5, opacity: 0, y: isPro ? 10 : 15 },
          animate: { scale: 1.2, opacity: 1, y: 0 },
          transition: { 
            type: 'spring' as const, 
            stiffness: 700, 
            damping: 15,
            mass: 0.5
          }
        };
      case 'shake':
        return {
          initial: { x: -10, opacity: 0 },
          animate: { x: [0, -10, 10, -10, 10, 0], opacity: 1 },
          transition: { duration: 0.4 }
        };
      case 'bounce':
        return {
          initial: { y: 20, opacity: 0 },
          animate: { y: [0, -20, 10, -5, 0], opacity: 1 },
          transition: { duration: 0.5 }
        };
      case 'slide':
        return {
          initial: { x: -50, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          transition: { type: 'spring' as const, stiffness: 200, damping: 25 }
        };
      case 'zoom':
        return {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { duration: 0.2, ease: "easeOut" as const }
        };
      case 'glitch':
        return {
          initial: { opacity: 0, x: 0 },
          animate: { 
            opacity: 1,
            x: [0, -1.5, 1.5, -1.5, 1.5, 0],
            filter: ['none', 'drop-shadow(2px 0 #8B4513) drop-shadow(-2px 0 #FF4500)', 'none']
          },
          transition: { duration: 0.3, repeat: Infinity, repeatDelay: 2 }
        };
      case 'rotate':
        return {
          initial: { rotate: -180, opacity: 0, scale: 0 },
          animate: { rotate: 0, opacity: 1, scale: 1 },
          transition: { type: 'spring' as const, stiffness: 260, damping: 20 }
        };
      case 'flip':
        return {
          initial: { rotateX: 90, opacity: 0 },
          animate: { rotateX: 0, opacity: 1 },
          transition: { duration: 0.5 }
        };
      case 'skate':
        return {
          initial: { x: -100, opacity: 0, skewX: -20 },
          animate: { x: 0, opacity: 1, skewX: 0 },
          transition: { type: 'spring' as const, stiffness: 100, damping: 10 }
        };
      case 'heartbeat':
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: [1, 1.2, 1, 1.1, 1], opacity: 1 },
          transition: { duration: 0.6 }
        };
      case 'float':
        return {
          initial: { y: 20, opacity: 0 },
          animate: { y: [0, -10, 0], opacity: 1 },
          transition: { 
            y: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
            opacity: { duration: 0.5 }
          }
        };
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.2, ease: "easeOut" as const }
        };
      case 'glow':
        return {
          initial: { opacity: 0, scale: 0.8, filter: 'drop-shadow(0 0 0px transparent)' },
          animate: { 
            opacity: 1, 
            scale: 1,
            filter: [
              'drop-shadow(0 0 0px transparent)',
              'drop-shadow(0 0 15px currentColor)',
              'drop-shadow(0 0 5px currentColor)'
            ]
          },
          transition: { duration: 0.4 }
        };
      case 'karaoke':
        return {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          transition: { duration: 0.1 }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.1 }
        };
    }
  };

  const textStyle: React.CSSProperties = {
    fontSize: `${style.fontSize}px`,
    color: style.color,
    fontFamily: style.font,
    textTransform: style.case === 'uppercase' ? 'uppercase' : style.case === 'lowercase' ? 'lowercase' : 'none',
    textShadow: [
      style.shadow ? `1.5px 1.5px 0px ${style.shadowColor || 'rgba(0,0,0,0.8)'}` : '',
      style.glow ? `0 0 10px ${style.color}, 0 0 20px ${style.color}` : ''
    ].filter(Boolean).join(', ') || 'none',
    WebkitTextStroke: style.border !== 'none' ? `${style.strokeWidth || 3}px ${style.outlineColor || '#000000'}` : 'none',
    paintOrder: 'stroke fill',
    ['WebkitPaintOrder' as any]: 'stroke fill',
    WebkitTextFillColor: style.color,
    backgroundColor: style.backgroundColor && style.backgroundColor !== 'transparent' ? style.backgroundColor : 'transparent',
    padding: style.backgroundColor && style.backgroundColor !== 'transparent' ? '4px 12px' : '0',
    borderRadius: '8px',
    display: 'inline-block',
    whiteSpace: 'pre-wrap',
    fontStyle: style.italic ? 'italic' : 'normal',
    fontWeight: style.fontWeight || '700'
  };

  const getPositionClass = (pos?: string) => {
    const p = pos || style.position;
    switch (p) {
      case 'top': return 'items-start justify-center pt-[15%]';
      case 'middle': return 'items-center justify-center';
      case 'bottom': return 'items-end justify-center pb-[12%]';
      case 'left': return 'items-center justify-start pl-12';
      case 'right': return 'items-center justify-end pr-12';
      case 'top-left': return 'items-start justify-start pt-[15%] pl-12';
      case 'top-right': return 'items-start justify-end pt-[15%] pr-12';
      case 'bottom-left': return 'items-end justify-start pb-[12%] pl-12';
      case 'bottom-right': return 'items-end justify-end pb-[12%] pr-12';
      default: return 'items-end justify-center pb-[12%]';
    }
  };

  const getAlignmentClass = (pos?: string) => {
    const p = pos || style.position;
    if (p.includes('left')) return 'text-left justify-start';
    if (p.includes('right')) return 'text-right justify-end';
    return 'text-center justify-center';
  };

  const getWordStyle = (word: CaptionWord, index: number): React.CSSProperties => {
    const finalShadow = style.shadowColor || propShadowColor;
    const baseStyle: React.CSSProperties = {
      fontFamily: style.font,
      fontSize: `${word.fontSize || style.fontSize}px`,
      color: word.color || (style.isDynamic ? getDynamicColor(index, word) : style.color),
      textTransform: style.case === 'uppercase' ? 'uppercase' : style.case === 'lowercase' ? 'lowercase' : 'none',
      backgroundColor: 'transparent',
      padding: '0.1em 0.15em',
      borderRadius: style.borderRadius || '0.2rem',
      letterSpacing: style.letterSpacing || 'normal',
      display: 'inline-block',
      whiteSpace: 'nowrap',
      wordBreak: 'keep-all',
      margin: '0.25em 0.6em',
      transition: 'all 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      fontStyle: style.italic ? 'italic' : 'normal',
      fontWeight: style.fontWeight || '900',
      textShadow: `0 2px 10px rgba(0,0,0,0.5)`,
    };

    if (style.tripleBorder && style.tripleBorderColors) {
      const c1 = style.tripleBorderColors[0] || '#FFD700'; 
      const c2 = style.tripleBorderColors[1] || '#0047AB'; 
      const c3 = style.tripleBorderColors[2] || '#000000'; 
      
      baseStyle.textShadow = `
        -0.5px -0.5px 0 ${c1}, 0.5px -0.5px 0 ${c1}, -0.5px 0.5px 0 ${c1}, 0.5px 0.5px 0 ${c1},
        -1.2px -1.2px 0 ${c2}, 1.2px -1.2px 0 ${c2}, -1.2px 1.2px 0 ${c2}, 1.2px 1.2px 0 ${c2},
        -2.5px -2.5px 0 ${c3}, 2.5px -2.5px 0 ${c3}, -2.5px 2.5px 0 ${c3}, 2.5px 2.5px 0 ${c3},
        0 4px 10px rgba(0,0,0,0.8)
      `.trim().replace(/\s+/g, ' ');
      
      (baseStyle as any).WebkitTextStroke = `1px ${c1}`;
    } else {
      if (style.border === 'thin') {
        (baseStyle as any).WebkitTextStroke = `${(style.strokeWidth || 1) * 0.4}px ${style.outlineColor || '#000000'}`;
      } else if (style.border === 'thick') {
        (baseStyle as any).WebkitTextStroke = `${(style.strokeWidth || 3) * 0.8}px ${style.outlineColor || '#000000'}`;
      }

      if (style.glow) {
        baseStyle.textShadow = `0 0 12px ${baseStyle.color}, 0 0 24px ${baseStyle.color}, 0 2px 8px rgba(0,0,0,0.4)`;
      }

      if (style.shadow) {
        baseStyle.textShadow = `1.5px 1.5px 0px ${finalShadow}, -1.5px -1.5px 0px ${finalShadow}, 1.5px -1.5px 0px ${finalShadow}, -1.5px 1.5px 0px ${finalShadow}, 0px 6px 15px rgba(0,0,0,0.7)`;
      }
    }
    
    if (style.background === 'box') {
      baseStyle.backgroundColor = 'rgba(0,0,0,0.85)';
    }

    if (style.background === 'pill') {
      baseStyle.backgroundColor = style.backgroundColor || 'rgba(0,0,0,0.85)';
      baseStyle.borderRadius = '2rem';
      baseStyle.padding = '0.4em 1em';
    }

    if (word.isHighlighted) {
      return {
        ...baseStyle,
        backgroundColor: word.highlightColor || '#facc15',
        color: '#000000',
        transform: 'rotate(-2deg) scale(1.15)',
        fontWeight: '800',
        boxShadow: `6px 6px 0px ${finalShadow}66`,
        textShadow: 'none',
        WebkitTextStroke: '0px',
      };
    }

    return baseStyle;
  };

  const handleDrag = (_: any, info: any) => {
    setIsDragging(true);
    const currentX = (style.x || 0) + info.offset.x;
    const currentY = (style.y || 0) + info.offset.y;
    setGuides({ x: Math.abs(currentX) < 10, y: Math.abs(currentY) < 10 });
  };

  const handleDragEnd = (_: any, info: any) => {
    setIsDragging(false);
    setGuides({ x: false, y: false });
    if (onUpdateStyle) {
      onUpdateStyle({
        x: (style.x || 0) + info.offset.x,
        y: (style.y || 0) + info.offset.y
      });
    }
  };

  const displayPosition = style.position || 'middle';
  const positionClass = getPositionClass(displayPosition);
  const alignmentClass = getAlignmentClass(displayPosition);

  const renderContent = () => {
    const currentLine = displayWords.find(line => adjustedTime >= line.start && adjustedTime <= line.end) || 
                       displayWords.find(line => adjustedTime >= line.end && adjustedTime <= line.end + 0.5);

    if (!currentLine) return null;

    const lineWords = words.filter(w => w.start >= currentLine.start && w.end <= (currentLine.end + 0.15));
    const isSequential = ['professional', 'snappy', 'zoom', 'typing', 'typewriter'].includes(animation);

    const lineContainerStyle: React.CSSProperties = {
      ...textStyle,
      maxWidth: '95%',
      margin: '0 auto',
      padding: (style.backgroundColor && style.backgroundColor !== 'transparent') ? (style.padding || '0.2em 0.5em') : 0,
      backgroundColor: (style.backgroundColor && style.backgroundColor !== 'transparent') ? style.backgroundColor : 'transparent',
      borderRadius: (style.backgroundColor && style.backgroundColor !== 'transparent') ? (style.borderRadius || '0.5rem') : 0,
    };

    if (isSequential || animation === 'karaoke' || animation === 'zeemo') {
      return (
        <div style={lineContainerStyle} className={`flex flex-nowrap ${alignmentClass} gap-x-[0.6em] gap-y-1 overflow-visible pointer-events-none items-center justify-center`}>
          {lineWords.map((w, i) => {
            const isVisible = adjustedTime >= w.start;
            const isActive = adjustedTime >= w.start && adjustedTime <= w.end;
            return (
              <motion.div 
                key={`word-${w.start}-${i}-${animation}`}
                animate={animation === 'zeemo' ? {
                  scale: isActive ? 1.25 : 1,
                  y: isActive ? -8 : 0,
                  color: isActive ? (style.threeColors?.[0] || '#FFD700') : (style.color || '#FFFFFF')
                } : animation === 'karaoke' ? {
                  color: isActive ? (style.threeColors?.[0] || '#FFFF00') : (style.color || '#FFFFFF'),
                } : {
                  opacity: isVisible ? 1 : 0,
                  scale: isVisible ? 1 : 0.9,
                  y: isVisible ? 0 : 5,
                  color: (isActive || isVisible) ? (w.color || (style.isDynamic ? getDynamicColor(i, w) : style.color)) : 'rgba(255,255,255,0.1)'
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
                style={{ ...getWordStyle(w, i), display: 'inline-block', opacity: isVisible ? 1 : 0 }}
              >
                {w.word}
              </motion.div>
            );
          })}
        </div>
      );
    }

    if (animation === 'pop' || animation === 'snappy-pop') {
      return (
        <AnimatePresence mode="popLayout">
          <div style={lineContainerStyle} className={alignmentClass}>
            <motion.div
              key={`${currentWord.word}-${currentWord.start}`}
              initial={{ scale: 0.8, opacity: 0, y: style.isSmart ? 8 : 12 }}
              animate={{ 
                scale: 1.15, opacity: 1, 
                y: driftOffset.y, x: driftOffset.x,
                color: getDynamicColor(words.indexOf(currentWord), currentWord)
              }}
              exit={{ scale: 0.9, opacity: 0, y: style.isSmart ? -5 : -8 }}
              transition={{ type: 'spring', stiffness: animation === 'snappy-pop' ? 700 : 450, damping: 25 }}
              style={{ ...getWordStyle(currentWord, words.indexOf(currentWord)), backgroundColor: 'transparent' }}
              className="font-bold text-center px-4 flex flex-nowrap justify-center items-center gap-[0.5em]"
            >
              {style.isDynamic ? currentWord.word.split(' ').map((w, i) => (
                <span key={i} style={{ color: (style.threeColors || ['#fff'])[ (words.findIndex(gw => gw.start === currentWord.start) + i) % (style.threeColors?.length || 1)] }}>{w}</span>
              )) : currentWord.word}
            </motion.div>
          </div>
        </AnimatePresence>
      );
    }

    return (
      <AnimatePresence mode="popLayout">
        <div style={lineContainerStyle} className={alignmentClass}>
          <motion.div
            key={`${currentWord.word}-${currentWord.start}`}
            {...getAnimationProps()}
            animate={{ ...(getAnimationProps()?.animate || {}), x: driftOffset.x, y: driftOffset.y }}
            style={{...getWordStyle(currentWord, words.indexOf(currentWord)), backgroundColor: 'transparent'}}
            className="font-bold flex items-center justify-center whitespace-nowrap overflow-visible gap-8"
          >
            {currentWord.word}
          </motion.div>
        </div>
      </AnimatePresence>
    );
  };

  return (
    <div className={`absolute inset-0 flex z-[100] ${positionClass} p-4 pointer-events-none`}>
      {isDragging && guides.x && <div className="absolute left-1/2 top-0 bottom-0 w-px bg-emerald-400/80 z-[101]" />}
      {isDragging && guides.y && <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-400/80 z-[101]" />}
      <motion.div 
        drag dragMomentum={false} onDrag={handleDrag} onDragEnd={handleDragEnd}
        animate={{ x: style.x || 0, y: style.y || 0 }}
        className="pointer-events-auto cursor-move flex flex-col items-center justify-center"
      >
        {renderContent()}
      </motion.div>
    </div>
  );
};

export default CaptionOverlay;
