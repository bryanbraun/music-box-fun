import { MBComponent } from './music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import { initialState } from '../state.js';
import { cloneDeep } from '../utils.js';
import { clearAllExistingNotes } from '../common/notes.js';
import { forEachNotes } from '../common/notes.js';
import { PULSE_PER_QUARTER_NOTE, NOTE_DURATION_IN_TICKS, TICKS_PER_PIXEL } from '../constants.js';

export class FileSelect extends MBComponent {
  constructor() {
    super({
      element: document.querySelector('#file')
    });

    this.handleChange = this.handleChange.bind(this);
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
      case 'export-midi':
        this.exportMidi();
        break;
    }

    event.target.value = 'file';
  }

  // Eventually: move the midi parts out into a separate file.
  async exportMidi() {
    const songData = musicBoxStore.state.songState.songData;
    const tempo = musicBoxStore.state.songState.tempo;
    const songTitle = musicBoxStore.state.songState.songTitle || 'Untitled Song';

    try {
      const { Midi } = await import('../vendor/@tonejs/midi.js');

      // Create a new MIDI file
      const midi = new Midi();
      midi.header.fromJSON({
        name: songTitle,
        ppq: PULSE_PER_QUARTER_NOTE,
        tempos: [
          {
            bpm: tempo,
            ticks: 0
          }
        ],
        timeSignatures: [
          {
            timeSignature: [4, 4],
            ticks: 0
          }
        ],
        keySignatures: [],
        meta: []
      });

      // Add a track
      const track = midi.addTrack();
      track.name = "Music Box";
      track.instrument.name = "music box";

      // Add notes to the track
      Object.keys(songData).forEach(pitchId => {
        forEachNotes(songData[pitchId], (yPos, isSilent) => {
          if (!isSilent) {
            const ticksPosition = yPos * TICKS_PER_PIXEL;

            track.addNote({
              name: pitchId,
              ticks: ticksPosition,
              durationTicks: NOTE_DURATION_IN_TICKS
            });
          }
        });
      });

      // Generate the MIDI file
      const midiData = midi.toArray();
      const blob = new Blob([midiData], { type: 'audio/midi' });

      // Create a download link and click it
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = `${songTitle.replace(/\s+/g, '_')}.mid`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      window.alert('An error occurred and the MIDI file could not be exported.');
      console.error('Error exporting MIDI:', error);
    }
  }

  render() {
    this.element.innerHTML = `
        <label>
          <span class="visuallyhidden">File</span>
          <select class="select file-select" data-testid="file-select" name="file-select">
            <option selected disabled value="file">File</option>
            <option value="new-song">New blank song</option>
            <option value="print-song">Print song</option>
            <option value="export-midi">Export as MIDI</option>
          </select>
        </label>
      `;

    this.element.querySelector('select').addEventListener('change', this.handleChange);
  }
}
