import { musicBoxStore } from '../music-box-store.js';
import { minifyMap } from '../state.js';
import { debounce } from '../utils/debounce.js';
import { cloneDeepWithRenamedKeys } from '../utils/clone.js';
import { adaptDataForVersions } from '../version-adapters.js';

export const urlManager = {
  currentVersion: 1,
  lastInternalUrlChange: '',

  getStateFromUrlAsync() {
    if (!location.hash) {
      return Promise.resolve();
    }

    // Our state data begins at character "2" because "0" is the "#" and "1" is the version number.
    const dataToLoad = location.hash.substring(2);
    const versionInUrl = Number(location.hash[1]);
    return JsonUrl('lzma').decompress(dataToLoad)
      .then(decompressedObject => {
        const invertedMinifyMap = {};
        Object.keys(minifyMap).forEach(key => {
          invertedMinifyMap[minifyMap[key]] = key;
        });

        const unminifiedSongState = cloneDeepWithRenamedKeys(decompressedObject, invertedMinifyMap);
        const versionAdaptedSongState = adaptDataForVersions(unminifiedSongState, versionInUrl);
        return versionAdaptedSongState;
      })
      .catch(error => {
        console.warn('The song could not be loaded from the URL.', error);
        return false;
      });
  },

  saveStateToUrlAsync() {
    const minifiedSongState = cloneDeepWithRenamedKeys(musicBoxStore.state.songState, minifyMap);

    return JsonUrl('lzma').compress(minifiedSongState).then(result => {
      const newHash = `${this.currentVersion}${result}`;
      this.lastInternalUrlChange = newHash;

      location.href = `#${newHash}`;
    });
  },

  subscribeUrlToStateChanges() {
    // We debounce URL updates to reduce processing and prevent potential race conditions
    // (like the page reload I was seeing during rapid slider changes).
    // Debouncing here means other parts of the UI can update in real time, which is nice.
    const DEBOUNCE_DELAY = 200;
    const debouncedUpdateUrlAsync = debounce(this.saveStateToUrlAsync.bind(this), DEBOUNCE_DELAY);
    musicBoxStore.subscribe('songState', debouncedUpdateUrlAsync);
  },

  // This fixes an edge-case where a user on the site would click the "back" button,
  // "forward" button, or a bookmarked link to another musicboxfun.com url, and the
  // song wouldn't load because the hashchange wouldn't re-render the page. We could
  // further optimize this case by rerendering specific components without reloading
  // the entire page.
  subscribeUrlToExternalHashChanges() {
    window.addEventListener('hashchange', event => {
      const newHash = event.newURL.split('#')[1];
      if (newHash !== this.lastInternalUrlChange) {
        location.reload();
      }
    });
  },
};
