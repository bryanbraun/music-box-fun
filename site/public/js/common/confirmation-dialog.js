// An confirmation popup using window.confirm, but returning
// a promise so it can be managed with async/await. We can replace
// window.confirm with a custom dialog in the future if we want to.
// See: https://vancelucas.com/blog/using-window-confirm-as-a-promise/
function confirmationDialog(msg) {
  return new Promise(function (resolve, reject) {
    let confirmed = window.confirm(msg);

    return confirmed ? resolve(true) : reject(false);
  });
}

export {
  confirmationDialog
}
