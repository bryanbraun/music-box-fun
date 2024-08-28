import { Store } from './alt-react/store.js';
import { initialState } from './state.js';
import { cloneDeep } from './utils/clone.js';

const musicBoxStore = new Store(cloneDeep(initialState));

export { musicBoxStore };
