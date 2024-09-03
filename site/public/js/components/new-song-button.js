import { MBComponent } from './music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import { initialState } from '../state.js';
import { cloneDeep } from '../utils/clone.js';
import { clearAllExistingNotes } from '../common/notes.js';

export class NewSongButton extends MBComponent {
  constructor() {
    super({
      element: document.querySelector('#file')
    });
  }

  handleClick() {
    let newSongState = cloneDeep(initialState).songState;

    newSongState.songData = clearAllExistingNotes(musicBoxStore.state.songState.songData);

    musicBoxStore.setState('songState', newSongState);

    window.scrollTo(0, 0);
  }

  render() {
    this.element.innerHTML = `
      <button class="new-song" data-testid="new-song">New blank song</button>
    `;

    this.element.querySelector('button').addEventListener('click', this.handleClick);
  }
}
