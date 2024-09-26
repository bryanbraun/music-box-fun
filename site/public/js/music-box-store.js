import { Store } from './alt-react/store.js';
import { initialState } from './state.js';
import { cloneDeep } from './utils.js';

const musicBoxStore = new Store(cloneDeep(initialState));

export { musicBoxStore };
