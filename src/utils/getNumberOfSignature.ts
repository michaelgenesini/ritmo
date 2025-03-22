import { Rhythm } from "./loadRhythms";

export const getNumberOfSignature = (rhythm: Rhythm) => {
  switch (rhythm.timeSignature) {
    case "3/4":
      return 3;
    case "4/4":
    default:
      return 4;
  }
};
