// JavaScript utilities
// These are the kinds of things you might find in a library like lodash.

// A deep clone that works for almost all cases (except cyclic references)
// See also: https://stackoverflow.com/a/34624648/1154642
export function cloneDeep(object) {
  if (!object) {
    return object;
  }

  let newObj = Array.isArray(object) ? [] : {};
  for (const key in object) {
    let value = object[key];
    newObj[key] = (typeof value === "object") ? cloneDeep(value) : value;
  }

  return newObj;
}

// We use this function to minify our state object before storing it in the URL, and
// unminify it after removing it from the URL. This shortens the URL by ≈50 characters.
export function cloneDeepWithRenamedKeys(object, renameMap) {
  if (!object) {
    return object;
  }

  let newObj = Array.isArray(object) ? [] : {};
  for (const key in object) {
    let value = object[key];
    let renamedKey = renameMap[key] ? renameMap[key] : key;
    newObj[renamedKey] = (typeof value === "object") ? cloneDeepWithRenamedKeys(value, renameMap) : value;
  }

  return newObj;
}

// Credit David Walsh (https://davidwalsh.name/javascript-debounce-function)

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
export function debounce(func, wait, immediate) {
  var timeout;

  // This is the function that is actually executed when
  // the DOM event is triggered.
  return function executedFunction() {
    // Store the context of this and any
    // parameters passed to executedFunction
    var context = this;
    var args = arguments;

    // The function to be called after
    // the debounce time has elapsed
    var later = function () {
      // null timeout to indicate the debounce ended
      timeout = null;

      // Call function now if you did not on the leading end
      if (!immediate) func.apply(context, args);
    };

    // Determine if you should call the function
    // on the leading or trail end
    var callNow = immediate && !timeout;

    // This will reset the waiting every function execution.
    // This is the step that prevents the function from
    // being executed because it will never reach the
    // inside of the previous setTimeout
    clearTimeout(timeout);

    // Restart the debounce waiting period.
    // setTimeout returns a truthy value (it differs in web vs node)
    timeout = setTimeout(later, wait);

    // Call immediately if you're dong a leading
    // end execution
    if (callNow) func.apply(context, args);
  };
};

export function throttle(func, delay) {
  // Previously called time of the function
  let prev = 0;
  return (...args) => {
    // Current called time of the function
    let now = new Date().getTime();

    // Logging the difference between previously called and current called timings
    // If difference is greater than delay call the function again.
    if (now - prev > delay) {
      prev = now;

      // "..." is the spread operator here
      // returning the function with the array of arguments
      return func(...args);
    }
  }
}

export function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function escapeAndHighlightHtml(text) {
  return escapeHtml(text)
    .replace(/\[\[/g, "<b>")
    .replace(/\]\]/g, "</b>");
}
