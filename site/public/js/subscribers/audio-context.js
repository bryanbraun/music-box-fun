import { musicBoxStore } from '../music-box-store.js';
import { getContext } from '../vendor/tone.js';

let audioContext = getContext();
let audioContextResuming = null;

function setupAudioContextFallbackForRestrictiveBrowsers() {
  document.addEventListener('click', () => {
    if (audioContext.state !== 'running') {
      // This calls the underlying WebAudio context (audioContext._context.resume())
      // instead of the Tone.js wrapper (audioContext.resume()), which wasn't working.
      // My PR for this was merged (see https://github.com/Tonejs/Tone.js/issues/767)
      // so next time I upgrade Tone.js, I can remove this workaround.
      audioContextResuming = audioContext._context.resume();

      audioContextResuming.then(() => {
        if (musicBoxStore.state.appState.audioDisabledMessageStatus === 'alerting') {
          musicBoxStore.setState('appState.audioDisabledMessageStatus', 'resolved');
        }
      });

    }
  }, true);
}

export {
  setupAudioContextFallbackForRestrictiveBrowsers,
  audioContextResuming
}
