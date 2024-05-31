import { musicBoxStore } from '../music-box-store.js';
import { minifyMap } from '../state.js';
import { debounce } from '../utils/debounce.js';
import { cloneDeepWithRenamedKeys } from '../utils/clone.js';
import { adaptDataForVersions } from '../version-adapters.js';
import JsonUrl from '../vendor/json-url.js';

export const urlManager = {
  currentVersion: 1,
  lastStateUpdateHash: '',

  getStateFromUrlAsync() {
    if (!location.hash) {
      return Promise.resolve();
    }

    // The useful information begins at character "1" because "0" is the "#" (and "1" is the version number).
    const hashStringWithVersion = location.hash.substring(1);
    return decodeHashString(hashStringWithVersion);
  },

  saveStateToUrlAsync() {
    const minifiedSongState = cloneDeepWithRenamedKeys(musicBoxStore.state.songState, minifyMap);

    return JsonUrl('lzma').compress(minifiedSongState).then(result => {
      const newHash = `${this.currentVersion}${result}`;
      this.lastStateUpdateHash = newHash;

      location.href = `#${newHash}`;
    });
  },

  subscribeUrlToStateChanges() {
    // We debounce URL updates to reduce processing and prevent potential race conditions
    // (like the page reload I was seeing during rapid slider changes).
    // Debouncing here means other parts of the UI can update in real time, which is nice.
    const DEBOUNCE_DELAY = 200;
    const debouncedUpdateUrlAsync = debounce(this.saveStateToUrlAsync.bind(this), DEBOUNCE_DELAY);
    musicBoxStore.subscribe('songState*', debouncedUpdateUrlAsync);
  },

  // This contains things we want to happen during a song navigation
  // change (mainly, updating the songState from the URL hash). It's
  // triggered on hashchange, which covers the following use-cases:
  //   - Back Button (and Undo)
  //   - Forward Button (and Redo)
  //   - Browsing to another Music Box Fun song within the app
  //   - Clicking a bookmarked song, while already in the app
  subscribeAppToNavigationChanges() {
    window.addEventListener('hashchange', async event => {
      const newHash = event.newURL.split('#')[1];

      // Filter our hashchanges caused by a state update, not navigation.
      if (newHash === this.lastStateUpdateHash) return;

      if (musicBoxStore.state.appState.offCanvasSidebarFocused !== 'none') {
        musicBoxStore.setState('appState.offCanvasSidebarFocused', 'none');
      }

      const hashState = await decodeHashString(newHash);

      if (hashState) {
        musicBoxStore.setState('songState', hashState);
      }
    });
  },
};

async function decodeHashString(hashStringWithVersion) {
  const versionNumber = Number(hashStringWithVersion[0]);
  const hashStringWithoutVersion = hashStringWithVersion.substring(1)

  return JsonUrl('lzma').decompress(hashStringWithoutVersion)
    .then(decompressedObject => {
      const invertedMinifyMap = {};
      Object.keys(minifyMap).forEach(key => {
        invertedMinifyMap[minifyMap[key]] = key;
      });

      const unminifiedSongState = cloneDeepWithRenamedKeys(decompressedObject, invertedMinifyMap);
      const versionAdaptedSongState = adaptDataForVersions(unminifiedSongState, versionNumber);
      return versionAdaptedSongState;
    })
    .catch(error => {
      console.warn('The song could not be decoded from the URL string.', error);
      return false;
    });
}
