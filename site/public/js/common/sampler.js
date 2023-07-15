import { Sampler } from '../vendor/tone.js';

let sampler;
let isSamplerLoaded = false;

function setupSampler() {
  // ToneJS can extrapolate other values on the scale, given a handful
  // of pitch samples. These samples were exported from beepbox (music box 1). See:
  // https://beepbox.co/#8n31s0k0l00e02t2mm0a7g0fj07i0r1o3210T5v1L4u32q1d5f8y1z7C1c0h0HU7000U0006000ET1v1L4ue3q3d6f8y5z1C0c0AbF8B5VaQ024bPa871E0002T1v1L4u90q1d4f7y3z1C0c2A9F3B5V8Q5428P9975E0019T2v1L4u15q0d1f8y0z1C2w0b4z000000000h40000000014g000000004h000000000p1HFE-3bwPbGcKIOY6ptFBT6n1CnwzbDbcK3cK2cI00000
  sampler = new Sampler({
    'C4': '/audio/C4.mp3',
    'E4': '/audio/E4.mp3',
    'G4': '/audio/G4.mp3',
    'C5': '/audio/C5.mp3',
    'E5': '/audio/E5.mp3',
    'G5': '/audio/G5.mp3',
    'C6': '/audio/C6.mp3',
    'E6': '/audio/E6.mp3',
    'G6': '/audio/G6.mp3'
  }, {
    onload: () => {
      // We use this testid to wait for the sampler to load before
      // triggering sampler usage in Cypress tests. In real usage,
      // we check isSamplerLoaded and simply don't play the note if
      // the sampler hasn't loaded yet.
      document.body.setAttribute('data-testid', 'sampler-loaded');
      isSamplerLoaded = true;
    },
    release: 4
  });

  sampler.toDestination();
}

export {
  setupSampler,
  sampler,
  isSamplerLoaded,
}
