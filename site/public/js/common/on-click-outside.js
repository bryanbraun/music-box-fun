// A function for setting up "click outside to close" listeners
// (aka "isolation layers"). It uses delegation so a single click
// listener can power all the isolation layers the app uses.
//
// Things we could do eventually:
//   - abstract the event into a "document click provider" that can
//     be used by this and anything else that wants a body click
//     (like the audio disabled message)?
//   - create a way to unregister these callbacks.

const registeredCallbacks = {};

export function onClickOutside(uniqueBoundarySelector, callback) {
  // Assumes that we only have a single "onClickOutside" per
  // uniqueBoundarySelector (which is a good assumption I think).
  registeredCallbacks[uniqueBoundarySelector] = callback;
};

export function setupOnClickOutside() {
  document.addEventListener('click', event => {
    // On click, check all the registered callbacks to see if there's
    // a matching selector. If so, run the callback, and pass the event.
    Object.keys(registeredCallbacks).forEach(selector => {
      if (!document.querySelector(selector).contains(event.target)) {
        registeredCallbacks[selector](event);
      }
    });
  });
}
