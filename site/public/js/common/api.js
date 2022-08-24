export const apiHostname =
  (location.hostname === 'localhost') ?
    `http://localhost:3000` : `https://api.${location.hostname}`;


/**
 * A wrapper for fetch, with built-in error handling. Handles both
 * network and status-code errors, by rejecting the promise and
 * passing along error information.
 *
 * If no errors occur, we resolve the promise and return valid data.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 *
 * @return {Promise}           The request promise
 */
export function request(url, options) {
  return new Promise((resolve, reject) => {
    fetch(url, options)
      .then(response => {
        // Handles the fetch response, parses the data, and creates a unified
        // JSON object containing both the response data and status info.
        return response.json()
          .then(json => ({
            status: response.status,
            ok: response.ok,
            json
          }))
      })
      .then(response => {
        if (response.ok) {
          return resolve(response.json);
        }
        return reject(response);
      })
      .catch(error => reject({
        status: "Network Error",
        ok: false,
        json: error
      }));
  });
}
