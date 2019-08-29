let synth;

function setupSynth() {
  // I landed on these values by tinkering on https://tonejs.github.io/examples/simpleSynth.html
  // I'm sure I could get better ones somehow. The beepbox music box notes sound perfect.
  const synthOptions = {
    oscillator: {
      type: 'sine'
    },
    envelope: {
      attack: 0.01,
      decay: 0.16,
      sustain: 0.1,
      release: 1.24
    }
  };

  synth = new Tone.PolySynth(10, Tone.Synth).toMaster();
  synth.set(synthOptions);
}

export {
  setupSynth,
  synth,
}
