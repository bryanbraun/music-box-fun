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
