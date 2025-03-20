export const getNoteVerticalPosition = (note: string) => {
  if (note === "B") return "top-0";
  if (note === "T") return "top-1/2 transform -translate-y-1/2";
  if (note === "S") return "bottom-0";
  if (note === "SS") return "bottom-0";
  return "hidden";
};
