import { MBComponent } from '../music-box-component.js';
import { PaperDivider } from './paper-divider.js';
import { musicBoxStore } from '../music-box-store.js';
import { getFinalNoteYPos } from '../common/notes.js';
import { QUARTER_BAR_GAP, NOTE_LINE_STARTING_GAP, FOOTER_BUTTON_HEIGHT, NUMBER_OF_BARS_PER_PAGE } from '../common/constants.js';

export class PaperFooter extends MBComponent {
  constructor() {
    super({
      renderTrigger: 'songState.songData*',
      element: document.querySelector('#paper-footer')
    });

    musicBoxStore.subscribe('songState.songData', () => this.render(true)); // see render() for why we subscribe to this separately.
    musicBoxStore.subscribe('ResizePaper', (newNumberOfPages) => this.render(true, newNumberOfPages)); // see render() for why we subscribe to this separately.

    // Bindings
    this.extendSongPaper = this.extendSongPaper.bind(this);
    this.trimSongPaper = this.trimSongPaper.bind(this);
  }

  setNumberOfPages(numberOfPages) {
    document.documentElement.style.setProperty('--number-of-bars', numberOfPages * NUMBER_OF_BARS_PER_PAGE);
  }

  // This can include blank pages added by the user.
  getNumberOfPagesFromScreen() {
    return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--number-of-bars').trim()) / NUMBER_OF_BARS_PER_PAGE;
  }

  getNumberOfPagesFromSongData() {
    return Math.ceil((getFinalNoteYPos() - NOTE_LINE_STARTING_GAP) / (NUMBER_OF_BARS_PER_PAGE * QUARTER_BAR_GAP)) || 1;
  }

  extendSongPaper() {
    this.render(true, this.getNumberOfPagesFromScreen() + 1);
  }

  trimSongPaper() {
    this.render(true, this.getNumberOfPagesFromScreen() - 1);
  }

  /*
      There are five cases for rendering this component:

      CASE                                  TRIGGER                        PAGE NUMBER CHANGE
      1. Initial song load                  manual (from main.js)          Yes - Calculate from songData
      2. Multiple note change (link click   songState.songData             Yes - Calculate from songData
         or space editor drag release)
      3. Extend song                        manual (from extendSongPaper)  Yes - Fixed length change
      4. Trim song                          manual (from trimSongPaper)    Yes - Fixed length change
      5. Space editor drag across pages     manual event publish           Yes - Fixed length change
      6. Note change (for the divider "×")  songState.songData*            No  - No changes needed

      By giving params to our render function and manually passing values into render() for
      cases 1, 2, 3, 4, and 5 we can render the PAGE NUMBER appropriately in all 6 cases.
  */
  render(isUpdatingPageCount, newNumberOfPages) {
    if (isUpdatingPageCount) {
      this.setNumberOfPages(newNumberOfPages || this.getNumberOfPagesFromSongData());
    }

    const numberOfDividers = this.getNumberOfPagesFromScreen() - 1;

    this.element.innerHTML = `
      <div id="dividers">
        ${Array(numberOfDividers).fill()
        .map((val, index) => `<div id="divider-${index + 1}" class="divider" data-testid="divider"></div>`)
        .join('')}
      </div>
      <button class="extend-song-button" title="Extend Song" data-testid="extend">
        <span class="dashed-line"></span>
        +
      </button>
    `;

    for (let i = 0; i < numberOfDividers; i++) {
      new PaperDivider({
        dividerNumber: i + 1,
        isTrimmable: this.getNumberOfPagesFromSongData() <= (i + 1),
        yFromBottom: FOOTER_BUTTON_HEIGHT + ((numberOfDividers - i) * NUMBER_OF_BARS_PER_PAGE * QUARTER_BAR_GAP),
        trimSongPaper: this.trimSongPaper
      }).render();
    }

    this.element.querySelector('.extend-song-button').addEventListener('click', this.extendSongPaper);
  }
}
