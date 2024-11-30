import { MBComponent } from './music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import { initialState } from '../state.js';
import { cloneDeep } from '../utils.js';
import { clearAllExistingNotes } from '../common/notes.js';

export class FileSelect extends MBComponent {
  constructor() {
    super({
      element: document.querySelector('#file')
    });
  }

  handleChange(event) {
    switch (event.target.value) {
      case 'new-song':
        let newSongState = cloneDeep(initialState).songState;
        newSongState.songData = clearAllExistingNotes(musicBoxStore.state.songState.songData);
        musicBoxStore.setState('songState', newSongState);
        window.scrollTo(0, 0);
        break;
      case 'print-song':
        window.print()
        break;
    }

    event.target.value = 'file';
  }

  render() {
    this.element.innerHTML = `
        <label>
          <span class="visuallyhidden">File</span>
          <select class="select file-select" data-testid="file-select" name="file-select">
            <option selected disabled value="file">File</option>
            <option value="new-song">New blank song</option>
            <option value="print-song">Print song</option>
          </select>
        </label>
      `;

    this.element.querySelector('select').addEventListener('change', this.handleChange);
  }
}
