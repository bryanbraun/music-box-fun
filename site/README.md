# Frontend

The static frontend for the app. It's bundle-free and powered by ES Modules.

## Running it locally

From the root project directory:

- `make dev-site` - Start the static site server
- `make stop-site` - Stops the static site server

To test with local SSL (needed for copy-to-clipboard), install [simplehttp2server](https://github.com/GoogleChromeLabs/simplehttp2server#installation), and run it in the `public` folder.

## Updating dependencies

1. Update the versions in `package.json`
2. Run `npm install && npm build`
