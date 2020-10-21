import { musicBoxStore } from '../music-box-store.js';
import { sampler } from '../common/sampler.js';
import { forEachNotes } from '../common/silent-notes.js';
import { Transport, Part } from '../vendor/tone.js';

const TICKS_PER_PIXEL = 4;

export const audioPlayer = {
  isSongNeedsUpdated: true,

  // Convert our songData into a format that ToneJS can read.
  //  - Each note becomes a time-pitch pair: [time, pitch]
  //  - The pitch is a string in Scientific Pitch Notation
  //  - The time is measured in ticks (Pulse Per Quarter):
  //     - The duration of a tick is relative to the tempo.
  //     - 192 ticks = 1 quarter note.
  //     - 48px = 1 quarter note (in our UI).
  //     - Thus, to convert, it's 4 ticks per pixel.
  //
  //  For more details, see:
  //  https://github.com/Tonejs/Tone.js/wiki/Time#ticks
  buildSequence(songData) {
    const sequenceArray = [];

    Object.keys(songData).forEach(pitchId => {
      forEachNotes(songData[pitchId], (yPos, isSilent) => {
        if (!isSilent) {
          let tickNum = yPos * TICKS_PER_PIXEL;
          sequenceArray.push([`${tickNum}i`, pitchId]);
        }
      });
    });

    return sequenceArray;
  },

  defineSong() {
    Transport.loop = false;
    Transport.timeSignature = 4;
    Transport.bpm.value = musicBoxStore.state.songState.tempo;

    const sequence = this.buildSequence(musicBoxStore.state.songState.songData);

    // The "Part" class is built on a base-class that references Tone's default audioContext.
    // Thus, the Transport is able to see the events in this "song" when it's time to play the timeline.
    const song = new Part(function(time, note) {
      sampler.triggerAttackRelease(note, '8n', time);
    }, sequence).start(0);
  },

  toggleAudioPlayer() {
    const playheadToViewportTop = document.querySelector('.music-box__playhead').getBoundingClientRect().top;
    const songTopToViewportTop = document.querySelector('#note-lines').getBoundingClientRect().top;
    const songPlayheadPositionPixels = playheadToViewportTop - songTopToViewportTop;
    const songPlayheadPositionTicks = songPlayheadPositionPixels * TICKS_PER_PIXEL;

    if (this.isSongNeedsUpdated) {
      Transport.cancel();
      this.defineSong();
      this.isSongNeedsUpdated = false;
    }

    if (musicBoxStore.state.appState.isPlaying) {
      Transport.ticks = songPlayheadPositionTicks;
      Transport.start();
    } else {
      Transport.stop();
    }
  },

  flagSongAsNeedsUpdated() {
    this.isSongNeedsUpdated = true;
  },

  subscribeToSongChanges() {
    musicBoxStore.subscribe('songState*', this.flagSongAsNeedsUpdated.bind(this));
  },

  subscribeToPlayState() {
    musicBoxStore.subscribe('appState.isPlaying', this.toggleAudioPlayer.bind(this));
  }
}
