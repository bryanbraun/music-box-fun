import { Store } from './alt-react/store.js';
import { state } from './state.js';
import { cloneDeep } from './utils/clone.js';

const musicBoxStore = new Store(cloneDeep(state));

window.MusicBoxStore = musicBoxStore; // for easy inspecting

export { musicBoxStore };
