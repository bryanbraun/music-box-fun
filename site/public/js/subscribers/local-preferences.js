import { musicBoxStore } from '../music-box-store.js';

const THICKER_STAFF_LINES_KEY = 'musicboxfun:thickerStaffLines';

export function loadLocalPreferences() {
  try {
    const storedValue = window.localStorage.getItem(THICKER_STAFF_LINES_KEY);

    if (storedValue === null) return;

    musicBoxStore.state.appState.thickerStaffLines = storedValue === 'true';
  } catch (error) {
    // localStorage can throw errors in some browsers/privacy modes
  }
}

export function subscribeLocalPreferencesToState() {
  const persistThickerStaffLines = () => {
    try {
      window.localStorage.setItem(
        THICKER_STAFF_LINES_KEY,
        String(musicBoxStore.state.appState.thickerStaffLines === true)
      );
    } catch (error) {
      // localStorage can throw errors in some browsers/privacy modes
    }
  };

  persistThickerStaffLines.id = 'persistThickerStaffLines';
  musicBoxStore.subscribe('appState.thickerStaffLines', persistThickerStaffLines);
}
