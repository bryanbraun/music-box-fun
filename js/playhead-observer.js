let playheadObserver;

function setupPlayheadObserver() {
  const synth = new Tone.Synth().toMaster();

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
