import { musicBoxStore } from '../music-box-store.js';
import { getContext } from '../vendor/tone.js';

let audioContext = getContext();

function setupAudioContextFallbackForRestrictiveBrowsers() {
  document.addEventListener('click', event => {
    if (audioContext.state !== 'running') {
      // This calls the underlying WebAudio context (audioContext._context.resume())
      // instead of the Tone.js wrapper (audioContext.resume()), which wasn't working.
      // If my PR for the Safari issue gets merged, then the problem should be fixed
      // and I can call the Tone.js wrapper again, which might be safer.
      // So next time I upgrade Tone.js, I should see if my fix is merged and in the,
      // new version, and then remove this workaround. See my issue and PR here:
      // https://github.com/Tonejs/Tone.js/issues/767
      audioContext._context.resume().then(() => {
        if (musicBoxStore.state.appState.audioDisabledMessageStatus === 'alerting') {
          musicBoxStore.setState('appState.audioDisabledMessageStatus', 'resolved');
        }
      });

    }
  }, true);
}

export {
  setupAudioContextFallbackForRestrictiveBrowsers,
}
