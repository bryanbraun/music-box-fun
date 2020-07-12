import { Component } from '../alt-react/component.js';
import { musicBoxStore } from '../music-box-store.js';
import { state as initialState } from '../state.js';
import { cloneDeep } from '../utils/clone.js';

export class NewSongButton extends Component {
  constructor() {
    super({
      element: document.querySelector('#file')
    });
  }

  handleClick() {
    let newSongState = cloneDeep(initialState).songState;
    newSongState.songData = cloneDeep(musicBoxStore.state.songState.songData);

    // Build a new songState using the initial state in
    // state.js, but with the currently-selected box type.
    Object.keys(newSongState.songData).forEach(pitchId => {
      newSongState.songData[pitchId] = [];
    });

    musicBoxStore.setState('songState', newSongState);
    window.scrollTo(0, 0);
  }

  render() {
    this.element.innerHTML = `
      <button class="new-song">New blank song</button>
    `;

    this.element.querySelector('button').addEventListener('click', this.handleClick);
  }
}
