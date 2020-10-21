import { sampler } from './common/sampler.js';
import { musicBoxStore } from './music-box-store.js';
import { Transport } from './vendor/tone.js';

function setupTestObjects() {
  window.MusicBoxFun = {};
  window.MusicBoxFun.store = musicBoxStore; // for easy inspecting
  window.MusicBoxFun.sampler = sampler; // for stubbing note triggers in tests.
  window.MusicBoxFun.Transport = Transport; // for spying on play state in tests.
}

export {
  setupTestObjects
}

