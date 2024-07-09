import { MBComponent } from '../music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import { cloneDeep } from '../utils/clone.js';
import { QUARTER_BAR_GAP, EIGHTH_BAR_GAP, NOTE_LINE_STARTING_GAP } from '../common/constants.js';

export class MeasureEditor extends MBComponent {
  constructor() {
    super({
      renderTrigger: 'songState.songData*',
      element: document.querySelector('#measure-editor')
    });

    // Using local state? Set the initial values here in the constructor.
    // this.state.counter = 0;

    // To use "this" inside of our methods, bind it here in the constructor.
    // this.getFinalNoteYPos = this.getFinalNoteYPos.bind(this);
  }

  getFinalNoteYPos() {
    let finalNoteYPos = 0;

    Object.values(musicBoxStore.state.songState.songData).forEach((noteLine) => {
      finalNoteYPos = Math.max(finalNoteYPos, noteLine[noteLine.length - 1] || 0);
    });

    return finalNoteYPos; // Returns zero if the song is empty.
  }

  handleMeasureEditorClick(event) {
    const clickedEl = event.target;

    if (clickedEl.classList.contains('measure-editor-button')) {
      const isAddButton = clickedEl.classList.contains('measure-add-button');
      const isRemoveButton = clickedEl.classList.contains('measure-remove-button');
      const threshold = parseInt(clickedEl.dataset.threshold, 10);
      const newSongData = cloneDeep(musicBoxStore.state.songState.songData);
      let needsStateUpdate = false;

      Object.entries(newSongData).forEach(([noteLineId, noteLine]) => {
        const noteLineInProgress = noteLine.concat(threshold).sort((a, b) => a - b);

        // if notes exist after the threshold value, adjust their positions.
        if (noteLineInProgress[noteLineInProgress.length - 1] !== threshold) {
          needsStateUpdate = true;
          const thresholdIndex = noteLineInProgress.indexOf(threshold);

          for (let i = thresholdIndex + 1; i < noteLineInProgress.length; i++) {
            if (isAddButton) {
              noteLineInProgress[i] += QUARTER_BAR_GAP;
            } else if (isRemoveButton) {
              noteLineInProgress[i] -= QUARTER_BAR_GAP;
            }
          }

          noteLineInProgress.splice(thresholdIndex, 1);
          newSongData[noteLineId] = noteLineInProgress;
        }
      });

      if (needsStateUpdate) {
        musicBoxStore.setState('songState.songData', newSongData);
      }
    }
  }

  renderMeasureEditorButtons() {
    let buttonsMarkup = '';
    let isNextButtonAddButton = true;

    // @TODO: change < to <= if we need a different behavior when the final note is on the line.
    for (let yPos = NOTE_LINE_STARTING_GAP; yPos < this.getFinalNoteYPos(); yPos += EIGHTH_BAR_GAP /* 24 */) {

      if (isNextButtonAddButton) {
        buttonsMarkup += `
          <button class="measure-add-button measure-editor-button" style="transform: translateY(${yPos}px)" data-threshold="${yPos}" title="Add Measure">
            +
          </button>
        `;
      } else {
        buttonsMarkup += `
          <button class="measure-remove-button measure-editor-button" style="transform: translateY(${yPos}px)" data-threshold="${yPos}" title="Remove Measure">
            -
          </button>
        `;
      }

      isNextButtonAddButton = !isNextButtonAddButton;
    }

    return buttonsMarkup;
  }

  // @TODO: currently, when we add a measure, this component re-renders once for every adjusted note line.
  //        ideally, it would only render once. This "measure adding" feature introduces multiple note adjustments
  //        at once, so possibly there are other components that are re-rendering multiple times as well. I should
  //        try to cut unnecessary re-renders in this component, and check for issues in other components as well.
  render() {
    console.log('MeasureEditor was rendered');

    this.element.style.height = `${this.getFinalNoteYPos()}px`;
    this.element.innerHTML = `
      ${this.renderMeasureEditorButtons()}
    `;

    // You can add event listeners on every render, even on `this.element,` because identical event
    // listeners will be discarded by the browser. See https://stackoverflow.com/a/10364316/1154642
    this.element.addEventListener('click', this.handleMeasureEditorClick);
  }
}
