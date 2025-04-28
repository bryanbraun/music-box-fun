import { MBComponent } from './music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import { initialState } from '../state.js';
import { cloneDeep } from '../utils.js';
import { clearAllExistingNotes, isCurrentSongEmpty } from '../common/notes.js';
import { confirmationDialog } from '../common/confirmation-dialog.js';
import { getMidiBlobFromSongState, getSongStateFromMidiBlob } from '../common/midi.js';
import { DEFAULT_SONG_TITLE } from '../constants.js';

export class FileDropdown extends MBComponent {
  constructor() {
    super({
      element: document.querySelector('#file-dropdown')
    });

    this.handleDropdownItemClick = this.handleDropdownItemClick.bind(this);
    this.handleMidiImport = this.handleMidiImport.bind(this);
  }

  async handleDropdownItemClick(event) {
    // Only handle clicks on menu items, not the entire menu
    if (!event.target.classList.contains('file-dropdown__item')) return;

    const action = event.target.dataset.action;

    switch (action) {
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
        window.print();
        break;
      case 'import-midi':
        try {
          if (!isCurrentSongEmpty()) {
            await confirmationDialog('Importing this song will overwrite your current song. \nAre you sure you want to continue?');
          }
          const hiddenFileInput = this.element.querySelector('input[type=file]');
          hiddenFileInput.click(); // This works in Safari because it's triggered from a click event
        } catch (error) { } // User cancelled the confirmation dialog, do nothing.
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

    // Hide the dropdown after selection
    event.target.dispatchEvent(new CustomEvent('menuClose', { bubbles: true }));
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

    // We reset the file input value to allow re-importing of the same file.
    event.target.value = '';
  }

  render() {
    // Note: this heading is a div to work around a bug. See: https://github.com/vanillawc/wc-menu-wrapper/issues/3
    this.element.innerHTML = `
      <wc-menu-wrapper id="file-dropdown__menu" heading="file-dropdown__heading" item="file-dropdown__item">
        <div class="select file-dropdown__heading" role="button">File</div>
        <button class="file-dropdown__item" data-action="new-song">New blank song</button>
        <button class="file-dropdown__item" data-action="import-midi">Import MIDI</button>
        <button class="file-dropdown__item" data-action="export-midi">Export as MIDI</button>
        <button class="file-dropdown__item" data-action="print-song">Print song</button>
      </wc-menu-wrapper>

      <input
        type="file"
        class="hidden"
        accept=".mid, .midi"
      />
    `;

    this.element.querySelector('#file-dropdown__menu').addEventListener('click', this.handleDropdownItemClick); // Uses event delegation
    this.element.querySelector('input[type=file]').addEventListener('change', this.handleMidiImport);
  }
}
