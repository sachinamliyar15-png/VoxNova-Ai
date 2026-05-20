import { CaptionWord, CaptionStyle } from '../types';

export const groupWordsIntoLines = (words: CaptionWord[], wordsPerLine: number, isSmart?: boolean): CaptionWord[] => {
  if (words.length === 0) return [];
  
  const limit = Math.max(1, wordsPerLine);
  const grouped: CaptionWord[] = [];
  
  if (limit === 1) {
    return words.map(w => ({ ...w }));
  }

  if (isSmart && limit > 1) {
    let i = 0;
    while (i < words.length) {
      const currentWord = words[i];
      const nextWord = words[i + 1];
      const nextNextWord = words[i + 2];
      let count = 1;
      
      if (nextWord && limit >= 2) {
        const gap = nextWord.start - currentWord.end;
        if (gap < 0.2 && ((currentWord.word?.length || 0) + (nextWord.word?.length || 0) < 12)) {
          count = 2;
          if (nextNextWord && limit >= 3) {
            const gap2 = nextNextWord.start - nextWord.end;
            if (gap2 < 0.1) count = 3;
          }
        }
      }
      
      const chunk = words.slice(i, i + count);
      grouped.push({
        word: chunk.map(w => w.word).join('\u00A0\u00A0\u00A0\u00A0'),
        start: chunk[0].start,
        end: chunk[chunk.length - 1].end
      });
      i += count;
    }
  } else {
    for (let i = 0; i < words.length; i += limit) {
      const chunk = words.slice(i, i + limit);
      grouped.push({
        word: chunk.map(w => w.word).join('\u00A0\u00A0\u00A0\u00A0'),
        start: chunk[0].start,
        end: chunk[chunk.length - 1].end
      });
    }
  }

  for (let i = 0; i < grouped.length - 1; i++) {
    const current = grouped[i];
    const next = grouped[i + 1];
    const gap = next.start - current.end;
    if (gap > 0 && gap < 0.2) {
      current.end = next.start;
    }
  }

  if (grouped.length > 0 && grouped[0].start < 0.5) {
    grouped[0].start = 0;
  }

  if (grouped.length > 0) {
    const last = grouped[grouped.length - 1];
    if (last.end - last.start < 1.0) {
      last.end += 1.0;
    }
  }

  return grouped;
};

export const generateSRT = (words: CaptionWord[]) => {
  return words.map((word, i) => {
    const formatTime = (seconds: number) => {
      const date = new Date(0);
      date.setSeconds(seconds);
      const timeString = date.toISOString().substr(11, 8);
      const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, '0');
      return `${timeString},${ms}`;
    };
    return `${i + 1}\n${formatTime(word.start)} --> ${formatTime(word.end)}\n${word.word}\n`;
  }).join('\n');
};

export const generateASS = (words: CaptionWord[], style: CaptionStyle, videoWidth: number = 1280, videoHeight: number = 720, captionOffset: number = 0, overrideFontName?: string) => {
  const isPortrait = videoHeight > videoWidth;
  
  const displayWords = groupWordsIntoLines(words.map(w => ({
    ...w,
    start: Math.max(0, w.start - (captionOffset / 1000)),
    end: Math.max(0, w.end - (captionOffset / 1000))
  })), style.wordsPerLine);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const alignment = 2; 
  const fontName = overrideFontName || style.font || 'Inter';

  const hexToAss = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      const r = cleanHex[0] + cleanHex[0];
      const g = cleanHex[1] + cleanHex[1];
      const b = cleanHex[2] + cleanHex[2];
      return `&H00${b}${g}${r}`;
    }
    if (cleanHex.length === 6) {
      return `&H00${cleanHex.substring(4, 6)}${cleanHex.substring(2, 4)}${cleanHex.substring(0, 2)}`;
    }
    return '&H00FFFFFF';
  };

  const assColor = hexToAss(style.color);
  const assOutlineColor = hexToAss(style.outlineColor || '#000000');
  const assShadowColor = hexToAss(style.shadowColor || '#000000');
  
  const c1 = style.tripleBorderColors?.[0] ? hexToAss(style.tripleBorderColors[0]) : assOutlineColor;
  const c2 = style.tripleBorderColors?.[1] ? hexToAss(style.tripleBorderColors[1]) : assOutlineColor;
  const c3 = style.tripleBorderColors?.[2] ? hexToAss(style.tripleBorderColors[2]) : assShadowColor;

  const outline = style.tripleBorder ? 3.5 : (style.strokeWidth || (style.border === 'thick' ? 5 : style.border === 'thin' ? 2 : 0));
  const shadow = style.tripleBorder ? 0 : (style.shadow ? 4 : 0);
  const spacing = 4; 
  const baseResY = 720;
  const scaledSize = Math.round(style.fontSize * (videoHeight / baseResY) * 1.3);

  // Calculate vertical margin from bottom (Alignment 2)
  const yPosPercent = style.yPos || 85; 
  const marginV = Math.round(videoHeight * (1 - yPosPercent / 100)) - (scaledSize / 2);

  let ass = `[Script Info]
ScriptType: v4.00+
PlayResX: ${videoWidth}
PlayResY: ${videoHeight}
ScaledBorderAndShadow: yes
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColor, SecondaryColor, OutlineColor, BackColor, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontName},${scaledSize},${assColor},&H000000FF,${assOutlineColor},${assShadowColor},1,0,0,0,100,100,${spacing},0,1,${outline},${shadow},${alignment},20,20,${marginV},1
Style: Layer3,${fontName},${scaledSize},${assColor},&H000000FF,${c3},&H00000000,1,0,0,0,100,100,${spacing},0,1,4.5,0,${alignment},20,20,${marginV},1
Style: Layer2,${fontName},${scaledSize},${assColor},&H000000FF,${c2},&H00000000,1,0,0,0,100,100,${spacing},0,1,2.5,0,${alignment},20,20,${marginV},1
Style: Layer1,${fontName},${scaledSize},${assColor},&H000000FF,${c1},&H00000000,1,0,0,0,100,100,${spacing},0,1,1.0,0,${alignment},20,20,${marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  displayWords.forEach((w, idx) => {
    const isDevanagari = /[\u0900-\u097F]/.test(w.word);
    let text = (style.case === 'uppercase' && !isDevanagari) ? w.word.toUpperCase() : (style.case === 'lowercase' && !isDevanagari) ? w.word.toLowerCase() : w.word;
    text = text.replace(/\u00A0\u00A0\u00A0\u00A0/g, '\\h\\h\\h\\h'); 

    const highlightColor = hexToAss(w.highlightColor || '#facc15');
    if (w.isHighlighted) {
      text = `{\\c&H000000}{\\3c${highlightColor}}{\\4c${highlightColor}}{\\bord8}{\\shad0}{\\3a&H00}${text}`;
    }
    
    if (style.tripleBorder) {
      const startTime = formatTime(w.start);
      const endTime = formatTime(w.end);
      ass += `Dialogue: 0,${startTime},${endTime},Layer3,,0,0,0,,${text}\n`;
      ass += `Dialogue: 1,${startTime},${endTime},Layer2,,0,0,0,,${text}\n`;
      ass += `Dialogue: 2,${startTime},${endTime},Layer1,,0,0,0,,${text}\n`;
    } else {
      if (style.isDynamic) {
        const colors = style.threeColors || ['#ffffff', '#ffff00', '#00ff00'];
        const color = colors[idx % colors.length];
        const assWordColor = hexToAss(color);
        text = `{\\c${assWordColor}}${text}`;
      }
      ass += `Dialogue: 0,${formatTime(w.start)},${formatTime(w.end)},Default,,0,0,0,,${text}\n`;
    }
  });

  return ass;
};

export const burnCaptions = async (
  ffmpeg: any,
  videoFile: File,
  assContent: string,
  onProgress?: (progress: number) => void,
  fontName: string = 'Inter'
): Promise<string> => {
  const { fetchFile } = await import('@ffmpeg/util');

  const fontMapping: Record<string, string> = {
    'Inter': 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/inter/Inter-Bold.ttf',
    'Poppins': 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Bold.ttf',
    'Montserrat': 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/montserrat/Montserrat-Bold.ttf',
    'Rajdhani': 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/rajdhani/Rajdhani-Bold.ttf',
    'Bangers': 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/bangers/Bangers-Regular.ttf',
    'Luckiest Guy': 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/luckiestguy/LuckiestGuy-Regular.ttf'
  };

  try {
    // 1. Cleanup old files to avoid memory pressure
    try {
      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('output.mp4');
      await ffmpeg.deleteFile('subtitles.ass');
      await ffmpeg.deleteFile('font.ttf');
    } catch (e) { /* ignore */ }

    // 2. Write video file
    const videoData = await fetchFile(videoFile);
    await ffmpeg.writeFile('input.mp4', videoData);
    
    // 3. Download and write font
    const fontUrl = fontMapping[fontName] || fontMapping['Inter'];
    const fontRes = await fetch(fontUrl);
    if (!fontRes.ok) throw new Error(`Failed to download font: ${fontName}`);
    const fontData = new Uint8Array(await fontRes.arrayBuffer());
    await ffmpeg.writeFile('font.ttf', fontData);
    
    // 4. Create fonts.conf
    const fontsConf = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>/</dir>
  <cachedir>/cache</cachedir>
  <match target="pattern">
    <test name="family"><string>${fontName}</string></test>
    <edit name="file" mode="assign"><string>/font.ttf</string></edit>
  </match>
</fontconfig>`;
    await ffmpeg.writeFile('fonts.conf', fontsConf);
    
    // 5. Write modified ASS
    const modifiedAss = assContent.replace(/Fontname,[^,]+/g, `Fontname,${fontName}`);
    await ffmpeg.writeFile('subtitles.ass', modifiedAss);

    // 6. Progress monitoring
    let currentProgress = 0;
    const logHandler = ({ message }: { message: string }) => {
      // console.log("FFmpeg Log:", message);
      const timeMatch = message.match(/time=(\d+:\d+:\d+.\d+)/);
      if (timeMatch && onProgress) {
        currentProgress = Math.min(95, currentProgress + 0.5);
        onProgress(currentProgress);
      }
    };
    ffmpeg.on('log', logHandler);

    // 7. Execute burn
    // Use FONTCONFIG_FILE env variable for the ass filter
    await ffmpeg.exec([
      '-i', 'input.mp4',
      '-vf', 'ass=subtitles.ass',
      '-preset', 'ultrafast',
      '-c:v', 'libx264',
      '-c:a', 'copy',
      'output.mp4'
    ], {
      // @ts-ignore
      env: { FONTCONFIG_FILE: '/fonts.conf' }
    });

    ffmpeg.off('log', logHandler);
    if (onProgress) onProgress(100);

    const data = await ffmpeg.readFile('output.mp4');
    return URL.createObjectURL(new Blob([data], { type: 'video/mp4' }));
  } catch (err) {
    console.error("FFmpeg Error:", err);
    throw err;
  }
};
