// A place for event handlers we're using in multiple components.

// Delegated song-link clicker.
//
// When a link to another musicboxfun song is clicked, we want to jump to the top of the page.
// We do this with click events instead of onhashchange because otherwise we wouldn't be able
// to discern between song-link clicks and back/forward navigation (which we don't want to jump).
// The only case this doesn't catch is browser-bookmarked songs, which is a narrow-enough use-case
// that I'm ok with it falling back to a non-jumping behavior.
//
// @todo: I think this works inconsistently because it jumps before the default link behavior takes
//        effect (in other words, before the song changes). This seems to result in us not being at
//        the top of the page after the new song loads. I'll have to look into that.
export function jumpToTopIfASongWasClicked(event) {
  const clickedEl = event.target;

  if (clickedEl.tagName !== 'A') return;

  const leadingHrefChar = clickedEl.outerHTML.split('href="')[1][0];

  if (leadingHrefChar === '#') {
    window.scrollTo(0, 0);
  }
}
