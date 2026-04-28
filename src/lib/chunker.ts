export function chunkText(text: string, maxChars: number = 800, overlap: number = 100): string[] {
  const chunks: string[] = [];
  
  const segments = text.split(/\n\n+/);
  
  if (segments.length === 0) return chunks;
  
  let currentChunk = segments[0];
  
  for (let i = 1; i < segments.length; i++) {
    const nextSegment = segments[i];
    
    if (currentChunk.length + 2 + nextSegment.length <= maxChars) {
      currentChunk += "\n\n" + nextSegment;
    } else {
      chunks.push(currentChunk);
      
      if (nextSegment.length <= maxChars) {
        if (overlap > 0 && currentChunk.length > overlap) {
          const overlapText = currentChunk.slice(-overlap);
          currentChunk = overlapText + "\n\n" + nextSegment;
        } else {
          currentChunk = nextSegment;
        }
      } else {
        const hardChunks = Math.ceil(nextSegment.length / maxChars);
        for (let j = 0; j < hardChunks; j++) {
          const start = j * maxChars;
          const chunkText = nextSegment.slice(start, start + maxChars);
          if (j === 0 && overlap > 0 && currentChunk.length > overlap) {
            chunks.push(currentChunk.slice(-overlap) + chunkText);
          } else {
            chunks.push(chunkText);
          }
        }
        currentChunk = "";
      }
    }
  }
  
  if (currentChunk) chunks.push(currentChunk);
  
  return chunks;
}
