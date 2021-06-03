function setupServiceWorker() {

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => {
        // registration succeeded
      }).catch(error => {
        console.error('service worker registration failed', error);
      });
  }
}

export {
  setupServiceWorker
}
