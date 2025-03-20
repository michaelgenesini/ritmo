import { Rhythm } from "./loadRhythms";

export const getNumberOfSignature = (rhythm: Rhythm) =>
  rhythm.timeSignature === "3/4" ? 3 : 4;
