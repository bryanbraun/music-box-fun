import { MBComponent } from '../music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import { state as initialState } from '../state.js';
import { cloneDeep } from '../utils/clone.js';

export class NewSongButton extends MBComponent {
  constructor() {
    super({
      element: document.querySelector('#file')
    });
  }

  handleClick() {
    let newSongState = cloneDeep(initialState).songState;

    // Build a new songState using the initial state in
    // state.js, but with the currently-selected box type.
    newSongState.songData = cloneDeep(musicBoxStore.state.songState.songData);

    Object.keys(newSongState.songData).forEach(pitchId => {
      newSongState.songData[pitchId] = [];
    });

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
