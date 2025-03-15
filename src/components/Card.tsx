import { Rhythm } from "@/utils/loadRhythms";

type Props = {
  onClick(): void;
  rhythm: Rhythm;
  active: boolean;
};

export const Card = ({ active, onClick, rhythm }: Props) => {
  const baseClassName = "border rounded-lg p-4 cursor-pointer transition";
  const className = active ? `${baseClassName} bg-green-100` : baseClassName;

  return (
    <div className={className} onClick={onClick}>
      <h2 className="text-xl font-bold">{rhythm.name}</h2>
      <p className="text-gray-400">Time signature: {rhythm.timeSignature}</p>
      <p className="text-gray-400">
        Vocal Pattern: {rhythm.vocal_pattern || "-"}
      </p>
      <p className="text-gray-400">Pattern: {rhythm.pattern}</p>
    </div>
  );
};
