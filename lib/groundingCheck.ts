/**
 * Loosely checks whether a claimed "missing" item might actually be
 * present in the resume text, to catch obvious LLM hallucinations
 * before they reach the user. This is intentionally permissive —
 * false negatives (letting a real gap through) are fine; false
 * positives (flagging a real skill as missing) are what we're guarding against.
 */
export function mightBeGrounded(evidencePhrase: string, resumeText: string): boolean {
  if (!evidencePhrase || !resumeText) return false;

  const normalize = (s: string) =>
    s.toLowerCase().replace(/[.,()]/g, "").replace(/\s+/g, " ").trim();

  const normalizedResume = normalize(resumeText);
  const normalizedPhrase = normalize(evidencePhrase);

  // Direct substring match
  if (normalizedResume.includes(normalizedPhrase)) return true;

  // Common degree/acronym equivalences worth checking explicitly,
  // since these are the exact cases that caused the original bug.
  const equivalences: Record<string, string[]> = {
    "bachelor": ["b.tech", "btech", "b.e.", "b.s.", "bs ", "bsc", "b.sc"],
    "mern": ["mongodb", "express", "react", "node"],
    "mean": ["mongodb", "express", "angular", "node"],
  };

  for (const [key, variants] of Object.entries(equivalences)) {
    if (normalizedPhrase.includes(key)) {
      if (variants.some((v) => normalizedResume.includes(v))) return true;
    }
  }

  return false;
}
