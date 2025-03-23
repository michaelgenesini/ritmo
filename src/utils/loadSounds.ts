type LoadSounds = {
  setAudioContext(context: AudioContext): void;
  setSounds(buffers: { [key: string]: AudioBuffer }): void;
};

export const loadSounds =
  ({ setAudioContext, setSounds }: LoadSounds) =>
  async () => {
    const context = new AudioContext();
    setAudioContext(context);

    const soundNames = [
      "djembe_B",
      "djembe_S",
      "djembe_T",
      "cowbell_T",
      "cowbell-dry_T",
    ];
    const buffers: { [key: string]: AudioBuffer } = {};

    for (const name of soundNames) {
      const response = await fetch(`/sounds/${name}.mp3`);
      const arrayBuffer = await response.arrayBuffer();
      buffers[name] = await context.decodeAudioData(arrayBuffer);
    }

    setSounds(buffers);
  };
