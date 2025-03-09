# Frontend

The static frontend for the app. It's bundle-free and powered by ES Modules.

## Running it locally

From the root project directory:

- `make dev-site` - Start the static site server
- `make stop-site` - Stops the static site server

The local development server uses SSL, which is required for frontend features like service-workers and copy-to-clipboard.

## Updating dependencies

1. Update the versions in `package.json`
2. Run `npm install`
