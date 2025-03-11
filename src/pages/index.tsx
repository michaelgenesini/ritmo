import { Note } from "@/components/Note";
import { useState, useEffect, useRef } from "react";
import { loadRhythms, Rhythm } from "@/utils/loadRhythms";
import { loadSounds } from "@/utils/loadSounds";
import { getNoteVerticalPosition } from "@/utils/getNoteVerticalPosition";
import { Button } from "@/components/Button";

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

export default function Ritmo() {
  const [rhythms, setRhythms] = useState<Rhythm[]>([]);
  const [selectedRhythm, setSelectedRhythm] = useState<Rhythm | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [sounds, setSounds] = useState<{ [key: string]: AudioBuffer } | null>(
    null
  );
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const beatTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const swingRatio = 1;

  const runloadSounds = loadSounds({ setAudioContext, setSounds });

  useEffect(() => {
    loadRhythms().then(setRhythms);
  }, []);

  // Load sounds
  useEffect(() => {
    runloadSounds();
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

  const playRhythm = () => {
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

  const stopRhythm = () => {
    isPlayingRef.current = false;
    setCurrentBeat(0);
    if (beatTimeout.current !== undefined) clearTimeout(beatTimeout.current);
  };

  const changeSelectedRhythm = (rhythm: Rhythm) => {
    stopRhythm();
    setSelectedRhythm(rhythm);
  };

  const togglePlayRhythm = () => {
    if (isPlayingRef.current) {
      stopRhythm();
    } else {
      playRhythm();
    }
  };

  const getNumberOfBeats = (rhythm: Rhythm) => {
    switch (rhythm.timeSignature) {
      case "4/4":
      default:
        return 16;
      case "3/4":
        return 12;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Ritmo - Percussion Rhythms</h1>
      <p className="text-gray-600 mb-4">Select a rhythm to play.</p>
      <div className="mb-8">
        {selectedRhythm && (
          <div className="mt-6 p-4 border rounded-lg shadow-md bg-white">
            <h2 className="text-2xl font-bold">{selectedRhythm.name}</h2>
            <p className="text-gray-500">
              <b>Tempo:</b>
              <br />
              {selectedRhythm.tempo} BPM
            </p>
            <p className="text-gray-500">
              <b>Time signature:</b>
              <br />
              {selectedRhythm.timeSignature}
            </p>
            <p className="text-gray-500">
              <b>Vocal Pattern:</b>
              <br />
              {selectedRhythm.vocal_pattern || "-"}
            </p>
            <p className="text-gray-500">
              <b>Pattern:</b>
              <br />
              {selectedRhythm.pattern4 ?? selectedRhythm.pattern}
            </p>

            <div className="relative my-24 grid grid-cols-16">
              {Array.from({ length: getNumberOfBeats(selectedRhythm) }).map(
                (_, beatIndex) => {
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
                        <div
                          className={`absolute ${getNoteVerticalPosition(
                            note
                          )}`}
                        >
                          <Note
                            note={note}
                            active={currentBeat === beatIndex}
                          />
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
            <Button onClick={togglePlayRhythm}>
              {isPlayingRef.current ? "Pause" : "Play"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rhythms.map((rhythm, index) => (
          <Card key={index} onClick={() => changeSelectedRhythm(rhythm)}>
            <h2 className="text-xl font-semibold">{rhythm.name}</h2>
            <p className="text-gray-500">Tempo: {rhythm.tempo} BPM</p>
            <p className="text-gray-500">
              Time signature: {rhythm.timeSignature}
            </p>
            <p className="text-gray-500">
              Vocal Pattern: {rhythm.vocal_pattern || "-"}
            </p>
            <p className="text-gray-500">Pattern: {rhythm.pattern}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
