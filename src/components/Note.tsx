const Bass = () => <div className="w-4 h-4 rounded-full bg-black" />;

const Tone = () => <div className="w-4 h-4 rounded-full bg-white border" />;

const Slap = () => (
  <div className="w-4 h-4 rounded-full bg-white border border-dashed" />
);

const Ghost = () => (
  <div className="w-4 h-4 rounded-full bg-white border border-transparent" />
);

export const Note = ({ note, active }: { note: string; active: boolean }) => {
  const activeClass = active
    ? "scale-110" //"border border-red-500 rounded-full"
    : ""; // "border border-transparent rounded-full";

  switch (note) {
    case "B":
    default:
      return (
        <div className={activeClass}>
          <Bass />
        </div>
      );
    case "T":
      return (
        <div className={activeClass}>
          <Tone />
        </div>
      );
    case "S":
      return (
        <div className={activeClass}>
          <Slap />
        </div>
      );
    case "X":
      return (
        <div className={activeClass}>
          <Ghost />
        </div>
      );
  }
};
