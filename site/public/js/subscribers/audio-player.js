import { musicBoxStore } from '../music-box-store.js';
import { sampler } from '../common/sampler.js';
import { startScrolling, stopScrolling } from '../common/page-scroller.js';
import { forEachNotes } from '../common/notes.js';
import { Transport, Part, getContext } from '../vendor/tone.js';
import { audioContextResuming } from './audio-context.js';
import { PLAYHEAD_TO_VIEWPORT_TOP, PULSE_PER_QUARTER_NOTE, NOTE_DURATION_IN_TICKS, TICKS_PER_PIXEL } from '../constants.js';

const audioContext = getContext();

export const audioPlayer = {
  isSongNeedsUpdated: true,

  // Convert our songData into a format that ToneJS can read.
  //  - Each note becomes a time-pitch pair: [time, pitch]
  //  - The pitch is a string in Scientific Pitch Notation
  //  - The time is measured in ticks, where "8i" = 8 ticks
  //    from the beginning of the song (see constants.js for
  //    more details about timing and ticks).
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
    Transport.bpm.value = musicBoxStore.state.songState.tempo;

    const sequence = this.buildSequence(musicBoxStore.state.songState.songData);

    // The "Part" class is built on a base-class that references Tone's default audioContext.
    // Thus, the Transport is able to see the events in this "song" when it's time to play the timeline.
    new Part((time, note) => {
      sampler.triggerAttackRelease(note, `${NOTE_DURATION_IN_TICKS}i`, time);
    }, sequence).start(0);
  },

  // Check that audio is ready and then toggle the audioPlayer (or otherwise notify the user)
  checkAndToggleAudioPlayer() {
    if (audioContext.state === 'running') {
      this.toggleAudioPlayer();
    } else if (audioContextResuming) {
      audioContextResuming.then(this.toggleAudioPlayer.bind(this));
    } else {
      // if the context isn't running or in the process of getting running, then we'll need a click to
      // get it started (it's likely that someone tried to play the song via space-bar when the browser
      // is expecting a click in order to enable the audioContext). This message will notify the user.
      musicBoxStore.setState('appState.isPlaying', false);
      musicBoxStore.setState('appState.audioDisabledMessageStatus', 'alerting');
    }
  },

  toggleAudioPlayer() {
    const songTopToViewportTop = document.querySelector('#note-lines').getBoundingClientRect().top;
    const songPlayheadPositionPixels = PLAYHEAD_TO_VIEWPORT_TOP - songTopToViewportTop;
    const songPlayheadPositionTicks = songPlayheadPositionPixels * TICKS_PER_PIXEL;

    if (this.isSongNeedsUpdated) {
      Transport.cancel();
      this.defineSong();
      this.isSongNeedsUpdated = false;
    }

    if (musicBoxStore.state.appState.isPlaying) {
      Transport.ticks = songPlayheadPositionTicks;

      // We schedule the start 100ms in the future, as recommended here:
      // https://github.com/Tonejs/Tone.js/wiki/Performance#scheduling-in-advance
      Transport.start('+0.1');
    } else {
      Transport.stop();
      stopScrolling();
    }
  },

  setup() {
    Transport.PPQ = PULSE_PER_QUARTER_NOTE;
    Transport.timeSignature = 4;

    Transport.on('start', startScrolling);
    // Transport.on('stop', stopScrolling);

    //  ↑↑↑ Why is this commented? ↑↑↑
    // We *could* use Transport.on('stop') as our trigger to stopScrolling but we learned that
    // there is a tiny delay between Transport.stop() and the event firing. The asynchronous
    // nature of this delay made it difficult to reliably stop a playing song and then jump to
    // the top of the page (when clicking on a song link in the UI). Instead, we can just call
    // stopScrolling immediately after Transport.stop() (as shown above). This works because we
    // only call Transport.stop() in one place, and the timing of stopping isn't as crucial as
    // the timing of starting.
  },

  flagSongAsNeedsUpdated() {
    this.isSongNeedsUpdated = true;
  },

  subscribeToSongChanges() {
    // We could debounce this, but the callback is so lightweight that it's not necessary.
    musicBoxStore.subscribe('songState*', this.flagSongAsNeedsUpdated.bind(this));
  },

  subscribeToPlayState() {
    musicBoxStore.subscribe('appState.isPlaying', this.checkAndToggleAudioPlayer.bind(this));
  }
}
