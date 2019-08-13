import { Store } from './lib/store.js';
import { actions } from './actions.js';
import { mutations } from './mutations.js';
import { state } from './state.js';

export const musicBoxStore = new Store({
  actions,
  mutations,
  state
});
