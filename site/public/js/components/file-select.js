import { MBComponent } from './music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import { initialState } from '../state.js';
import { cloneDeep } from '../utils.js';
import { clearAllExistingNotes, isCurrentSongEmpty } from '../common/notes.js';
import { confirmationDialog } from '../common/confirmation-dialog.js';
import { getMidiBlobFromSongState, getSongStateFromMidiBlob } from '../common/midi.js';
import { DEFAULT_SONG_TITLE } from '../constants.js';

export class FileSelect extends MBComponent {
  constructor() {
    super({
      element: document.querySelector('#file')
    });

    this.handleDropdownChange = this.handleDropdownChange.bind(this);
  }

  async handleDropdownChange(event) {
    switch (event.target.value) {
      case 'new-song':
        if (isCurrentSongEmpty()) break;

        try {
          await confirmationDialog('Creating a new song will overwrite your current song. \nAre you sure you want to continue?');
          let newSongState = cloneDeep(initialState).songState;
          newSongState.songData = clearAllExistingNotes(musicBoxStore.state.songState.songData);
          musicBoxStore.setState('songState', newSongState);
          window.scrollTo(0, 0);
        } catch (error) { } // User cancelled the confirmation dialog, do nothing.
        break;
      case 'print-song':
        window.print()
        break;
      case 'import-midi':
        try {
          if (!isCurrentSongEmpty()) {
            await confirmationDialog('Importing this song will overwrite your current song. \nAre you sure you want to continue?');
          }
          const hiddenFileInput = this.element.querySelector('input[type=file]');
          hiddenFileInput.click(); // Triggers handleMidiImport()
        } catch (error) { }; // User cancelled the confirmation dialog, do nothing.
        break;
      case 'export-midi':
        try {
          const blob = await getMidiBlobFromSongState(musicBoxStore.state.songState);
          const songTitleToExport = musicBoxStore.state.songState.songTitle || DEFAULT_SONG_TITLE;
          const downloadLink = document.createElement('a');
          downloadLink.href = URL.createObjectURL(blob);
          downloadLink.download = `${songTitleToExport.replace(/\s+/g, '_')}.mid`;
          downloadLink.click();
        } catch (error) {
          window.alert('An error occurred and the MIDI file could not be exported.');
          console.error('Error exporting MIDI:', error);
        }
        break;
    }

    event.target.value = 'file'; // In all cases, return focus to the "File" option.
  }

  async handleMidiImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const [newSongState, meta] = await getSongStateFromMidiBlob(file);

      musicBoxStore.setState('songState', newSongState);

      if (meta.someNotesCouldNotBeImported) {
        // We use setTimeout to ensure the alert is shown after the state update (for a better user experience). This is
        // necessary because even though the state change runs first (synchronously), the alert still blocks the UI thread.
        setTimeout(() => {
          window.alert('Some notes could not be imported because they were outside of the range of this music box. \n\nAll other notes were imported successfully. 👍');
        }, 0);
      }
    } catch (error) {
      window.alert('An error occurred and the MIDI file could not be imported.');
      console.error('Error importing MIDI:', error);
    }

    // We reset the file input value to allow re-importing the same file.
    event.target.value = '';
  }

  render() {
    this.element.innerHTML = `
        <label>
          <span class="visuallyhidden">File</span>
          <select class="select file-select" data-testid="file-select" name="file-select">
            <option selected disabled value="file">File</option>
            <option value="new-song">New blank song</option>
            <option value="import-midi">Import MIDI</option>
            <option value="export-midi">Export as MIDI</option>
            <option value="print-song">Print song</option>
          </select>
        </label>
        <input
          type="file"
          class="hidden"
          accept=".mid, .midi"
        />
      `;

    this.element.querySelector('select').addEventListener('change', this.handleDropdownChange);

    // We use a hidden file input for MIDI import to make it testable via Cypress.
    this.element.querySelector('input[type=file]').addEventListener('change', this.handleMidiImport);
  }
}
