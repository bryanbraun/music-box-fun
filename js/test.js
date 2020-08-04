import { sampler } from './common/sampler.js';
import { musicBoxStore } from './music-box-store.js';

function setupTestObjects() {
  window.MusicBoxFun = {};
  window.MusicBoxFun.store = musicBoxStore; // for easy inspecting
  window.MusicBoxFun.sampler = sampler; // for stubbing note triggers in tests.
}

export {
  setupTestObjects
}

