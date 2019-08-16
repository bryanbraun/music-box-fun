let playheadObserver;

function setupPlayheadObserver() {
  // I landed on these values by tinkering on https://tonejs.github.io/examples/simpleSynth.html
  // I'm sure I could get better ones somehow. The beepbox music box notes sound perfect.
  const synthOptions = {
    oscillator: {
      type: 'sine'
    },
    envelope: {
      attack: 0.01,
      decay: 0.16,
      sustain: 0.1,
      release: 1.24
    }
  };

  const synth = new Tone.PolySynth(10, Tone.Synth).toMaster();
  synth.set(synthOptions);

  // We get the playhead position by querying the playhead directly (instead of looking
  // up the CSS variable) because the variable uses calc which makes it difficult to
  // query. See https://stackoverflow.com/q/56229772/1154642.
  const playheadPosition = parseInt(
    getComputedStyle(document.querySelector('.music-box__playhead'))
      .getPropertyValue('top')
      .trim()
  );

  const options = {
    root: null,
    rootMargin: `-${playheadPosition}px 0px 0px 0px`,
    threshold: 0.5, // trigger event when 50% of the note crosses the threshold.
  }

  const isAtPlayhead = (objectPositionTop) => {
    const comparisonBuffer = 10;
    return Math.abs(objectPositionTop - playheadPosition < comparisonBuffer)
  }

  const intersectionHandler = (entries, observer) => {
    entries.forEach(entry => {
      if (isAtPlayhead(entry.boundingClientRect.top)) {
        synth.triggerAttackRelease(entry.target.parentElement.id, '8n');
        console.log(`A ${entry.target.parentElement.id} is at the playhead`);
      }
    });
  }

  playheadObserver = new IntersectionObserver(intersectionHandler, options);
}

export {
  setupPlayheadObserver,
  playheadObserver,
}
