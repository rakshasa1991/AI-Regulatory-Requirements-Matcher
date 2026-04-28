export function parseRequirements(rawText: string): string[] {
  const lines = rawText.split(/\r?\n/);
  
  const segments: string[] = [];
  let currentSegment: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      if (currentSegment.length > 0) {
        const segmentText = currentSegment.join(' ');
        if (segmentText.length >= 20) {
          segments.push(segmentText);
        }
        currentSegment = [];
      }
      continue;
    }
    
    const numberedListMatch = /^(\d+[\.\)])\s/.test(line);
    const letterListMatch = /^([a-zA-Z][\.\)])\s/.test(line);
    const headingMatch = /^(#{1,3}\s|^[А-ЯA-Z]{3,}[\.\)]\s)/.test(line);
    
    if (numberedListMatch || letterListMatch || headingMatch) {
      if (currentSegment.length > 0) {
        const segmentText = currentSegment.join(' ');
        if (segmentText.length >= 20) {
          segments.push(segmentText);
        }
      }
      currentSegment = [line.replace(/^(\d+[\.\)]\s|[a-zA-Z][\.\)]\s|#{1,3}\s|[А-ЯA-Z]{3,}[\.\)]\s)/, '')];
    } else {
      currentSegment.push(line);
    }
  }
  
  if (currentSegment.length > 0) {
    const segmentText = currentSegment.join(' ');
    if (segmentText.length >= 20) {
      segments.push(segmentText);
    }
  }
  
  if (segments.length === 0) {
    const paragraphs = rawText.split(/\n\n+/).map(p => p.trim()).filter(p => p.length >= 20);
    return paragraphs;
  }
  
  return segments;
}
