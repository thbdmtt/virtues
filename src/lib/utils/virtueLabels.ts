export function getScreenWeekVirtueLabel(nameFr: string): string {
  if (nameFr === "Respect de soi") {
    return "Respect";
  }

  if (nameFr === "Travail profond") {
    return "Profond";
  }

  if (nameFr.length <= 9) {
    return nameFr;
  }

  const words = nameFr.split(" ").filter(Boolean);
  const firstWord = words[0];
  const secondWord = words[1];

  if (firstWord && secondWord) {
    return `${firstWord} ${secondWord.charAt(0)}.`;
  }

  return `${nameFr.slice(0, 8).trimEnd()}.`;
}
