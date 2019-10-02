let sampler;

function setupSampler() {
  // ToneJS can extrapolate other values on the
  // scale, given a handful of samples like these.
  sampler = new Tone.Sampler({
    'C4': '/audio/C4.mp3',
    'E4': '/audio/E4.mp3',
    'G4': '/audio/G4.mp3',
    'C5': '/audio/C5.mp3',
    'E5': '/audio/E5.mp3',
    'G5': '/audio/G5.mp3',
    'C6': '/audio/C6.mp3',
  }, {
    onload: () => console.log('samples loaded'),
    release: 4
  });

  sampler.toMaster();
}

export {
  setupSampler,
  sampler,
}
