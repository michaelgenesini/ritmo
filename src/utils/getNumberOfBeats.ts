import { Rhythm } from "./loadRhythms";

export const getNumberOfBeats = (rhythm: Rhythm) => {
  switch (rhythm.timeSignature) {
    case "3/4":
      return 12;
    case "4/4":
    default:
      return 16;
    case "4/6":
      return 24;
  }
};
