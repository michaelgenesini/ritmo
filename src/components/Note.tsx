const Bass = () => <div className="w-3 h-3 rounded-full bg-black" />;

const Tone = () => <div className="w-3 h-3 rounded-full bg-white border" />;

const DoubleTone = () => (
  <div className="relative">
    <div className="w-3 h-3 rounded-full bg-red border" />
    <div className="absolute bottom-0 right-1 w-3 h-3 rounded-full bg-red border" />
  </div>
);

const Slap = () => (
  <div className="w-3 h-3 rounded-full bg-white border border-dashed" />
);

const DoubleSlap = () => (
  <div className="relative">
    <div className="w-3 h-3 rounded-full bg-red border border-dashed" />
    <div className="absolute bottom-0 right-1 w-3 h-3 rounded-full bg-red border border-dashed" />
  </div>
);

const Ghost = () => (
  <div className="w-3 h-3 rounded-full bg-white border border-transparent" />
);

export const Note = ({ note, active }: { note: string; active: boolean }) => {
  const activeClass = active
    ? "outline-2 outline-offset-2 outline-blue-600 rounded-full"
    : "outline-2 outline-offset-2 outline-transparent rounded-full";

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
    case "TT":
      return (
        <div className={activeClass}>
          <DoubleTone />
        </div>
      );
    case "SS":
      return (
        <div className={activeClass}>
          <DoubleSlap />
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
