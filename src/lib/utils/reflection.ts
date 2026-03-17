export function getReflectionParagraphs(reflection: string): string[] {
  return reflection
    .split(/(?<=\.)\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}
