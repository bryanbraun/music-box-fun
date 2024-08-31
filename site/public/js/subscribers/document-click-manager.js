const documentClickCallbacks = [];

// Set up a single click event for the document that any code can listen to.
// @TODO: see if the audio-disabled-message can use this instead of it's own.
export function setupDocumentClickManager() {
  document.addEventListener('click', event => {
    documentClickCallbacks.forEach(callback => {
      callback(event);
    });
  });
}

export function addDocumentClickListener(callback) {
  documentClickCallbacks.push(callback);
}

export function removeDocumentClickListener(callback) {
  documentClickCallbacks = documentClickCallbacks.filter(cb => cb !== callback);
}

// Add support for "isolation layers", by letting us register callbacks
// that run whenever a click happens outside of a targeted element (like
// a modal content box). This piggy-backs on our document click event.
//
// Things we could do eventually, if needed:
//   - create a way to unregister these callbacks.
//
// Data example:
// {
//   '#modal': function closeModal() { ... },
// }
const isolationLayers = {};

addDocumentClickListener(function handleIsolationLayerClick(event) {
  // On click, check all the registered callbacks to see if there's
  // a matching selector. If so, run the callback.
  Object.keys(isolationLayers).forEach(selector => {
    if (!document.querySelector(selector).contains(event.target)) {
      isolationLayers[selector](event);
    }
  });
});

// registerIsolationLayer
//
// @param {string} targetSelector - a unique selector for element inside our isolation layer.
// @param {function} callback - a function to run when a click happens outside the target element.
export function registerIsolationLayer(boundarySelector, callback) {
  isolationLayers[boundarySelector] = callback;
};
