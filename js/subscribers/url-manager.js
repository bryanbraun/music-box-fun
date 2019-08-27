import { musicBoxStore } from '../music-box-store.js';
import { minifyMap } from '../state.js';

export const urlManager = {
  currentVersion: '0',
  lastInternalUrlChange: '',

  getStateFromUrlAsync() {
    if (!location.hash) {
      return Promise.resolve();
    }

    // Our state data begins at character "2" because "0" is the "#" and "1" is the version number.
    const dataToLoad = location.hash.substring(2);
    return JsonUrl('lzma').decompress(dataToLoad)
      .then(decompressedObject => {
        const invertedMinifyMap = {};
        Object.keys(minifyMap).forEach(key => {
          invertedMinifyMap[minifyMap[key]] = key;
        });

        const unminifiedSongState = this.cloneDeepWithRenamedKeys(decompressedObject, invertedMinifyMap);
        return unminifiedSongState;
      });
  },

  saveStateToUrlAsync(state) {
    const minifiedSongState = this.cloneDeepWithRenamedKeys(state.songState, minifyMap);

    JsonUrl('lzma').compress(minifiedSongState).then(result => {
      const newHash = `${this.currentVersion}${result}`;
      location.href = `#${newHash}`;
      this.lastInternalUrlChange = newHash;
    });
  },

  // We use this function to minify our state object before storing it in the URL, and
  // unminify it after removing it from the URL. This shortens the URL by ≈50 characters.
  cloneDeepWithRenamedKeys(object, renameMap) {
    if (!object) {
      return object;
    }

    let newObj = Array.isArray(object) ? [] : {};
    for (const key in object) {
      let value = object[key];
      let renamedKey = renameMap[key] ? renameMap[key] : key;
      newObj[renamedKey] = (typeof value === "object") ? this.cloneDeepWithRenamedKeys(value, renameMap) : value;
    }

    return newObj;
  },

  // @TODO: We currently subscribe to all state changes. We only need to subscribe to
  //        songState changes. It might be easier to make this more granular in the future.
  subscribeUrlToStateChanges() {
    musicBoxStore.events.subscribe('state', this.saveStateToUrlAsync.bind(this));
  },

  // This fixes an edge-case where a user on the site could click a bookmarked
  // link to another musicboxfun.com url, but the song wouldn't load because the
  // hashchange wouldn't re-render the page. We could further optimize this case
  // by rerendering specific components without reloading the entire page.
  subscribeUrlToExternalHashChanges() {
    window.addEventListener('hashchange', event => {
      const newHash = event.newURL.split('#')[1];
      if (newHash !== this.lastInternalUrlChange) {
        location.reload();
      }
    });
  },
};
