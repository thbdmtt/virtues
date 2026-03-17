export function getReflectionParagraphs(reflection: string): string[] {
  const sentences =
    reflection
      .split(/(?<=\.)\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean) ?? [];
  const paragraphs: string[] = [];
  let buffer = "";

  for (const sentence of sentences) {
    const nextValue = buffer ? `${buffer} ${sentence}` : sentence;

    if (sentence.endsWith(".") && sentence.length < 60) {
      paragraphs.push(nextValue);
      buffer = "";
      continue;
    }

    buffer = nextValue;
  }

  if (buffer) {
    paragraphs.push(buffer);
  }

  return paragraphs;
}
