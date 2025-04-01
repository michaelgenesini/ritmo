import { getNoteVerticalPosition } from "@/utils/getNoteVerticalPosition";
import { getNumberOfBeats } from "@/utils/getNumberOfBeats";
import { getNumberOfSignature } from "@/utils/getNumberOfSignature";
import { Rhythm } from "@/utils/loadRhythms";
import { Note } from "@/components/Note";

type Props = {
  onClick(): void;
  rhythm: Rhythm;
  active: boolean;
  currentBeats: { [key: string]: number };
};

export const Card = ({ active, onClick, rhythm, currentBeats }: Props) => {
  const baseClassName =
    "border-2 bg-gray-50 hover:bg-gray-100 rounded-lg p-2 md:p-4 cursor-pointer transition";
  const className = active
    ? `${baseClassName} border-blue-600`
    : `${baseClassName} border-gray-200`;

  const numberOfBeats = getNumberOfBeats(rhythm);

  return (
    <div className={className} onClick={onClick}>
      <div className="text-xl font-bold flex items-center md:items-start justify-between">
        <div className="flex flex-col md:flex-row space-x-2 justify-center md:items-center">
          <h2>{rhythm.name}</h2>
          {rhythm.vocal_pattern && (
            <span className="text-sm">{rhythm.vocal_pattern}</span>
          )}
        </div>
        <div>
          <span>{rhythm.timeSignature}</span>
        </div>
      </div>

      <div className="rounded-lg mt-2">
        <div className="relative flex pt-12 pb-4 bg-white rounded-lg">
          {Array.from({ length: numberOfBeats }).map((_, beatIndex) => {
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

                {/* Horizontal */}
                {beatIndex === 0 && (
                  <div className="absolute top-1/2 right-0 w-1/2 border-t border-gray-300"></div>
                )}
                {beatIndex > 0 && beatIndex < numberOfBeats - 1 && (
                  <div className="absolute top-1/2 left-0 w-full border-t border-gray-300"></div>
                )}
                {beatIndex === numberOfBeats - 1 && (
                  <div className="absolute top-1/2 left-0 w-1/2 border-t border-gray-300"></div>
                )}

                {/* Vertical */}
                {beatIndex % signature === 0 ? (
                  <div className="absolute top-0 left-1/2 h-full border-l border-black"></div>
                ) : (
                  <div className="absolute top-0 left-1/2 h-full border-l border-gray-300"></div>
                )}

                {note && (
                  <div className={`absolute ${getNoteVerticalPosition(note)}`}>
                    <Note
                      note={note}
                      active={currentBeats[rhythm.name] === beatIndex}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
