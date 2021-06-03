self.addEventListener('install', onInstall);
self.addEventListener('fetch', onFetch);

function onInstall(event) {
  // Placeholder onInstall callback
  //
  // In the future, if we want to setup offline-first, we
  // can add application assets to the cache here.
  //
  // For now, we're holding off on this setup since it
  // would require that we manually maintain a large list
  // of frequently-changing assets (and update a cache
  // version number) with every code change. This might be
  // less of a hassle in the future if I end up creating a
  // build process for production.
}

function onFetch(event) {
  // Placeholder onFetch callback
  //
  // In the future if we want to conditionally serve assets
  // from cache, we can do that here.
}
