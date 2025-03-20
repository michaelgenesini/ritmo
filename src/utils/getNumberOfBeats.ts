import { Rhythm } from "./loadRhythms";

export const getNumberOfBeats = (rhythm: Rhythm) =>
  rhythm.timeSignature === "3/4" ? 12 : 16;
