import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';

export class ExtendSongButton extends Component {
  constructor(props) {
    super({
      element: document.querySelector('.extend-song-button')
    });
  }

  // @todo: add permanent boundary lines and song-trim buttons
  // I may need to move the logic out of this component when I do this.
  setInitialMusicLength() {
    const NUMBER_OF_BARS = 52;
    const BAR_LENGTH = 50;
    const STARTING_GAP = 16; // hole size
    const ENDING_GAP = 48;
    const FINAL_BAR_LINE = 1;
    const pageDivisor = (STARTING_GAP / 2) + (NUMBER_OF_BARS * BAR_LENGTH) + FINAL_BAR_LINE;

    const finalNoteYPos = Object.values(musicBoxStore.state.songState.songData).reduce((accumulator, currentValue) => {
      return Math.max(accumulator, Math.max(...currentValue));
    }, 0);

    const numberOfPages = Math.ceil(finalNoteYPos/pageDivisor) || 1;
    const initialMusicLength = STARTING_GAP + (NUMBER_OF_BARS * BAR_LENGTH * numberOfPages) + ENDING_GAP + FINAL_BAR_LINE;

    document.documentElement.style.setProperty('--default-music-length', `${initialMusicLength}px`);
  }

  extendSong() {
    const NUMBER_OF_BARS = 52; // @todo: consolidate these constants with the ones above?
    const BAR_LENGTH = 50;
    const root = document.documentElement;
    const currentMusicLength = parseInt(getComputedStyle(root).getPropertyValue('--default-music-length').trim());
    const newMusicLength = currentMusicLength + (NUMBER_OF_BARS * BAR_LENGTH);

    root.style.setProperty('--default-music-length', `${newMusicLength}px`);
  }

  render() {
    this.setInitialMusicLength();

    this.element.innerHTML = `+`;
    this.element.addEventListener('click', this.extendSong);
  }
}
