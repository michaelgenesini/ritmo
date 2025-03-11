export interface Rhythm {
  name: string;
  tempo: number;
  timeSignature: string;
  vocal_pattern?: string;
  pattern4?: string;
  pattern: string;
  notes: string;
}

export const loadRhythms = async (): Promise<Rhythm[]> => {
  const response = await fetch("/rhythms.json");
  const data = await response.json();
  return data.rhythms;
};
