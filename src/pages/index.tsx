import { useState, useEffect, useRef } from "react";

interface Rhythm {
  name: string;
  tempo: number;
  pattern4: string;
  pattern: string;
  notes: string;
}

// Base pattern 16 notes in 4/4:
// "O X X X O X X X O X X X O X X X"
const rhythms: Rhythm[] = [
  {
    name: "Djole 1",
    tempo: 80,
    // ta tada tidi ta tada tidi
    pattern4: "S X X S S X T T",
    pattern: "S X X S S X T T S X X S S X T T",
    notes: "A lively rhythm used in festivities.",
  },
  {
    name: "Djole 2",
    tempo: 80,
    // ta tu tidi ta tu tidi
    pattern4: "S X B X S S X X",
    pattern: "S X B X S S X X S X B X S S X X",
    notes: "A lively rhythm used in festivities.",
  },
];

const Bass = () => <div className="w-4 h-4 rounded-full bg-black" />;
const Tone = () => <div className="w-4 h-4 rounded-full bg-white border" />;
const Slap = () => (
  <div className="w-4 h-4 rounded-full bg-white border border-dashed" />
);
const Ghost = () => (
  <div className="w-4 h-4 rounded-full bg-white border border-transparent" />
);

const Note = ({ note, active }: { note: string; active: boolean }) => {
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

interface CardProps {
  children: React.ReactNode;
  onClick: () => void;
}

function Card({ children, onClick }: CardProps) {
  return (
    <div
      className="border rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition"
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

function Button({ children, onClick }: ButtonProps) {
  return (
    <button
      className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition cursor-pointer"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function Ritmo() {
  const [selectedRhythm, setSelectedRhythm] = useState<Rhythm | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [sounds, setSounds] = useState<{ [key: string]: AudioBuffer } | null>(
    null
  );
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const beatTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const swingRatio = 1;

  // Load sounds
  useEffect(() => {
    const loadSounds = async () => {
      const context = new AudioContext();
      setAudioContext(context);

      const soundNames = ["B", "S", "T"];
      const buffers: { [key: string]: AudioBuffer } = {};

      for (const name of soundNames) {
        const response = await fetch(`/sounds/${name}.mp3`);
        const arrayBuffer = await response.arrayBuffer();
        buffers[name] = await context.decodeAudioData(arrayBuffer);
      }

      setSounds(buffers);
    };

    loadSounds();
  }, []);

  const scheduleNextBeat = (index: number) => {
    if (!isPlayingRef.current || !selectedRhythm || !audioContext || !sounds)
      return;

    setCurrentBeat(index);

    const patternArray = selectedRhythm.pattern.split(" ");
    const note = patternArray[index % patternArray.length];

    if (note !== "X" && sounds[note]) {
      const source = audioContext.createBufferSource();
      source.buffer = sounds[note];
      source.connect(audioContext.destination);
      source.start();
    }

    const isOffbeat = index % 2 !== 0;
    const swingDelay = isOffbeat
      ? (60 / selectedRhythm.tempo) * 1000 * (swingRatio - 1)
      : 0;

    beatTimeout.current = setTimeout(() => {
      if (isPlayingRef.current) {
        scheduleNextBeat((index + 1) % 16);
      }
    }, (60 / selectedRhythm.tempo / 4) * 1000 + swingDelay);
  };

  const togglePlayRhythm = () => {
    if (!selectedRhythm || !audioContext || !sounds) return;

    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      if (beatTimeout.current !== undefined) clearTimeout(beatTimeout.current);
      return;
    }

    isPlayingRef.current = true;
    setCurrentBeat(0);
    scheduleNextBeat(0);
  };

  const getVerticalPosition = (note: string) => {
    if (note === "B") return "top-0";
    if (note === "T") return "top-1/2 transform -translate-y-1/2";
    if (note === "S") return "bottom-0";
    return "hidden";
  };

  const changeSelectedRhythm = (rhythm: Rhythm) => {
    togglePlayRhythm();
    setSelectedRhythm(rhythm);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Ritmo - Percussion Rhythms</h1>
      <p className="text-gray-600 mb-6">Select a rhythm to play.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rhythms.map((rhythm, index) => (
          <Card key={index} onClick={() => changeSelectedRhythm(rhythm)}>
            <h2 className="text-xl font-semibold">{rhythm.name}</h2>
            <p className="text-gray-500">Tempo: {rhythm.tempo} BPM</p>
          </Card>
        ))}
      </div>

      {selectedRhythm && (
        <div className="mt-6 p-4 border rounded-lg shadow-md bg-white">
          <h2 className="text-2xl font-bold">{selectedRhythm.name}</h2>
          <p className="text-gray-600">Tempo: {selectedRhythm.tempo} BPM</p>
          <p className="mt-2">{selectedRhythm.notes}</p>
          <p className="mt-4 font-mono">Pattern: {selectedRhythm.pattern}</p>

          <div className="relative my-24 grid grid-cols-16">
            {Array.from({ length: 16 }).map((_, beatIndex) => {
              const note =
                selectedRhythm.pattern.split(" ")[
                  beatIndex % selectedRhythm.pattern.split(" ").length
                ];
              return (
                <div
                  key={beatIndex}
                  className="relative w-full h-16 flex flex-col items-center"
                >
                  {/* Number */}
                  {beatIndex % 4 === 0 && (
                    <div className="absolute -top-8 font-bold">
                      {beatIndex / 4 + 1}
                    </div>
                  )}

                  {/* Horizontal */}
                  <div className="absolute top-1/2 left-0 w-full border-t border-gray-300"></div>
                  {/* Vertical */}
                  <div className="absolute top-0 left-1/2 h-full border-l border-gray-300"></div>

                  {/* Note */}
                  {note && (
                    <div className={`absolute ${getVerticalPosition(note)}`}>
                      <Note note={note} active={currentBeat === beatIndex} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <Button onClick={togglePlayRhythm}>
            {isPlayingRef.current ? "Pause" : "Play"}
          </Button>
        </div>
      )}
    </div>
  );
}
