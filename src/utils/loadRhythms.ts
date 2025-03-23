export interface Rhythm {
  name: string;
  tempo: number;
  timeSignature: string;
  instrument: "djembe" | "bell";
  vocal_pattern?: string;
  pattern4?: string;
  pattern: string;
  notes: string;
  hidden?: boolean;
}

export const loadRhythms = async (): Promise<Rhythm[]> => {
  const response = await fetch("/rhythms.json");
  const data = await response.json();
  return data.rhythms.filter((rhythm: Rhythm) => !rhythm.hidden);
};
