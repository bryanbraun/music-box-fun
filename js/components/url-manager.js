import { musicBoxStore } from '../music-box-store.js';

function subscribeUrlToStateChanges() {
  const saveToUrl = () => {
    const dataToSave = musicBoxStore.state.songState;
    const jsonUrl = JsonUrl('lzma');
    jsonUrl.compress(dataToSave).then(result => location.href = `#${result}`);
  };

  musicBoxStore.events.subscribe('state', saveToUrl);
}

function getStateFromUrlAsync() {
  if (!location.hash) {
    return Promise.resolve();
  }

  const jsonUrl = JsonUrl('lzma');
  const dataToLoad = location.hash.substring(1);
  return jsonUrl.decompress(dataToLoad);
}

export {
  subscribeUrlToStateChanges,
  getStateFromUrlAsync,
}


