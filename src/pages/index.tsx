import { useState, useEffect, useRef } from "react";
import { loadRhythms, Rhythm } from "@/utils/loadRhythms";
import { loadSounds } from "@/utils/loadSounds";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { getNumberOfBeats } from "@/utils/getNumberOfBeats";
import { getNumberOfSignature } from "@/utils/getNumberOfSignature";

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
  const [isPlaying, setIsPlaying] = useState(false);
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
    if (!activeRhythms.length) return;
    if (isPlaying) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      Object.values(beatTimeouts.current).forEach((timeout) => {
        if (timeout !== undefined) clearTimeout(timeout);
      });
    } else {
      setIsPlaying(true);
      isPlayingRef.current = true;
      activeRhythms.forEach((rhythm) => scheduleNextBeat(rhythm, 0));
    }
  };

  const toggleRhythmSelection = (rhythm: Rhythm) => {
    setActiveRhythms((prev) => {
      if (prev.find((r) => r.name === rhythm.name)) {
        return prev.filter((r) => r.name !== rhythm.name);
      }

      if (prev.length >= 3) return prev;

      return [...prev, rhythm];
    });
  };

  return (
    <div className="flex flex-col h-screen mx-auto grow-0">
      <div className="container mx-auto max-w-3xl p-4 flex justify-between align-center">
        <h1 className="text-3xl font-bold">Ritmo</h1>
      </div>

      {/* Scrollable List */}
      <div className="h-full overflow-y-auto">
        <div className="container mx-auto max-w-3xl flex flex-col space-y-4 p-4">
          {rhythms.map((rhythm, index) => (
            <Card
              key={index}
              onClick={() => toggleRhythmSelection(rhythm)}
              rhythm={rhythm}
              active={activeRhythms.some((r) => r.name === rhythm.name)}
              currentBeats={currentBeats}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-4 border-t-2 border-gray-300">
        <div className="flex mb-4 space-x-2 text-sm">
          {activeRhythms.map((rhythm) => (
            <div
              key={rhythm.name}
              className="px-2 rounded bg-gray-100 cursor-pointer border-2 border-blue-600 hover:border-gray-500"
              onClick={() => toggleRhythmSelection(rhythm)}
            >
              {rhythm.name}
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 align-center justify-center font-semibold ">
          <Button onClick={togglePlayAll}>
            <span className="px-4 py-2">{isPlaying ? "Pause" : "Play"}</span>
          </Button>
          <div>
            <Button onClick={() => setTempo((prev) => Math.max(40, prev - 5))}>
              <span className="px-4 py-2">-</span>
            </Button>
            <span className="px-2">BPM: {tempo}</span>
            <Button onClick={() => setTempo((prev) => Math.min(300, prev + 5))}>
              <span className="px-4 py-2">+</span>
            </Button>
          </div>
          <div>
            <Button
              onClick={() => setSwingRatio((prev) => Math.max(0.8, prev - 0.1))}
            >
              <span className="px-4 py-2">-</span>
            </Button>
            <span className="px-2">Swing: {swingRatio.toFixed(1)}</span>
            <Button
              onClick={() => setSwingRatio((prev) => Math.min(1.5, prev + 0.1))}
            >
              <span className="px-4 py-2">+</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
