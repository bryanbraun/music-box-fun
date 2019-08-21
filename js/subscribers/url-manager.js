import { musicBoxStore } from '../music-box-store.js';

export const urlManager = {
  lastInternalUrlChange: '',

  getStateFromUrlAsync() {
    if (!location.hash) {
      return Promise.resolve();
    }

    const jsonUrl = JsonUrl('lzma');
    const dataToLoad = location.hash.substring(1);
    return jsonUrl.decompress(dataToLoad);
  },

  saveStateToUrlAsync() {
    const dataToSave = musicBoxStore.state.songState;
    const jsonUrl = JsonUrl('lzma');
    jsonUrl.compress(dataToSave).then(result => {
      location.href = `#${result}`;
      this.lastInternalUrlChange = result;
    });
  },

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
