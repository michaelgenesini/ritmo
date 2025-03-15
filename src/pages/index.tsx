import { Note } from "@/components/Note";
import { useState, useEffect, useRef } from "react";
import { loadRhythms, Rhythm } from "@/utils/loadRhythms";
import { loadSounds } from "@/utils/loadSounds";
import { getNoteVerticalPosition } from "@/utils/getNoteVerticalPosition";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

export default function Ritmo() {
  const [tempo, setTempo] = useState(80);
  const [rhythms, setRhythms] = useState<Rhythm[]>([]);
  const [activeRhythms, setActiveRhythms] = useState<Rhythm[]>([]);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [sounds, setSounds] = useState<{ [key: string]: AudioBuffer } | null>(
    null
  );
  const [currentBeats, setCurrentBeats] = useState<{ [key: string]: number }>(
    {}
  );
  const isPlayingRef = useRef<boolean>(false);
  const beatTimeouts = useRef<{ [key: string]: NodeJS.Timeout | undefined }>(
    {}
  );

  const [swingRatio, setSwingRatio] = useState(1);
  const SWING_DIVIDER = 3;

  const runloadSounds = loadSounds({ setAudioContext, setSounds });

  useEffect(() => {
    loadRhythms().then(setRhythms);
  }, []);

  useEffect(() => {
    runloadSounds();
  }, []);

  const getNumberOfSignature = (rhythm: Rhythm) => {
    return rhythm.timeSignature === "3/4" ? 3 : 4;
  };

  const getNumberOfBeats = (rhythm: Rhythm) => {
    return rhythm.timeSignature === "3/4" ? 12 : 16;
  };

  const scheduleNextBeat = (rhythm: Rhythm, index: number) => {
    if (!isPlayingRef.current || !audioContext || !sounds) return;

    setCurrentBeats((prev) => ({ ...prev, [rhythm.name]: index }));

    const patternArray = rhythm.pattern.split(" ");
    const note = patternArray[index % patternArray.length];

    if (note !== "X" && sounds[note]) {
      const source = audioContext.createBufferSource();
      source.buffer = sounds[note];
      source.connect(audioContext.destination);
      source.start();
    }

    const isOffbeat = index % 2 !== 0;
    const swingDelay = isOffbeat
      ? ((60 / tempo) * 1000 * (swingRatio - 1)) / SWING_DIVIDER
      : 0;

    beatTimeouts.current[rhythm.name] = setTimeout(() => {
      if (isPlayingRef.current) {
        scheduleNextBeat(rhythm, (index + 1) % getNumberOfBeats(rhythm));
      }
    }, (60 / tempo / getNumberOfSignature(rhythm)) * 1000 + swingDelay);
  };

  const togglePlayAll = () => {
    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      Object.values(beatTimeouts.current).forEach((timeout) => {
        if (timeout !== undefined) clearTimeout(timeout);
      });
    } else {
      isPlayingRef.current = true;
      activeRhythms.forEach((rhythm) => scheduleNextBeat(rhythm, 0));
    }
  };

  const toggleRhythmSelection = (rhythm: Rhythm) => {
    if (activeRhythms.length > 2) return;

    setActiveRhythms((prev) =>
      prev.find((r) => r.name === rhythm.name)
        ? prev.filter((r) => r.name !== rhythm.name)
        : [...prev, rhythm]
    );
  };

  return (
    <div className="flex flex-col h-screen p-6 mx-auto grow-0">
      <h1 className="text-3xl font-bold mb-4">Ritmo - Percussion Rhythms</h1>
      <p className="text-gray-600 mb-4">Select rhythms to play together.</p>

      <div className="flex flex-col md:flex-row md:space-x-4">
        {/* Scrollable List */}
        <div className="md:w-1/3 h-full flex flex-col space-y-4 overflow-y-auto">
          {rhythms
            .filter((rhythm) => !rhythm.name.includes("Empty"))
            .map((rhythm, index) => (
              <Card
                key={index}
                onClick={() => toggleRhythmSelection(rhythm)}
                rhythm={rhythm}
                active={activeRhythms.some((r) => r.name === rhythm.name)}
              />
            ))}
        </div>

        <div className="md:w-2/3 h-full ">
          {/* Sticky Player */}
          <div className="fixed bottom-0 left-0 w-full md:relative bg-white p-4 border-t">
            {/* <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t"> */}
            <div className="container max-w-4xl mx-auto">
              {activeRhythms.length > 0 ? (
                <div className="p-4 rounded-lg bg-white">
                  {activeRhythms.map((rhythm) => (
                    <div key={rhythm.name} className="mb-4">
                      <div className="flex justify-between">
                        <h2 className="text-2xl font-bold mb-4 text-center">
                          {rhythm.name}
                        </h2>
                        <span
                          onClick={() => toggleRhythmSelection(rhythm)}
                          className="cursor-pointer"
                        >
                          Rimuovi
                        </span>
                      </div>
                      <div className="relative flex pt-12 pb-4 bg-gray-50 rounded-lg">
                        {Array.from({ length: getNumberOfBeats(rhythm) }).map(
                          (_, beatIndex) => {
                            const note =
                              rhythm.pattern.split(" ")[
                                beatIndex % rhythm.pattern.split(" ").length
                              ];
                            const signature = getNumberOfSignature(rhythm);
                            return (
                              <div
                                key={beatIndex}
                                className="relative w-full h-16 flex flex-col items-center"
                              >
                                {beatIndex % signature === 0 && (
                                  <div className="absolute -top-8 font-bold">
                                    {beatIndex / signature + 1}
                                  </div>
                                )}
                                <div className="absolute top-1/2 left-0 w-full border-t border-gray-300"></div>
                                <div className="absolute top-0 left-1/2 h-full border-l border-gray-300"></div>
                                {note && (
                                  <div
                                    className={`absolute ${getNoteVerticalPosition(
                                      note
                                    )}`}
                                  >
                                    <Note
                                      note={note}
                                      active={
                                        currentBeats[rhythm.name] === beatIndex
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  Select one or more rhythms
                </div>
              )}
              <div className="flex items-center justify-center space-x-4 mt-4">
                <Button onClick={togglePlayAll}>
                  {isPlayingRef.current ? "Pause" : "Play"}
                </Button>
                <Button
                  onClick={() => setTempo((prev) => Math.max(40, prev - 5))}
                >
                  -
                </Button>
                <span className="text-lg font-semibold">{tempo} BPM</span>
                <Button
                  onClick={() => setTempo((prev) => Math.min(300, prev + 5))}
                >
                  +
                </Button>
                <Button
                  onClick={() =>
                    setSwingRatio((prev) => Math.max(0.8, prev - 0.1))
                  }
                >
                  -
                </Button>
                <span className="text-lg font-semibold">
                  Swing: {swingRatio.toFixed(1)}
                </span>
                <Button
                  onClick={() =>
                    setSwingRatio((prev) => Math.min(1.5, prev + 0.1))
                  }
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
