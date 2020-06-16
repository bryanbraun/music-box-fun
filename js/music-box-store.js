import { Store } from './alt-react/store.js';
import { state } from './state.js';

const musicBoxStore = new Store(state);

window.MusicBoxStore = musicBoxStore; // for easy inspecting

export { musicBoxStore };
