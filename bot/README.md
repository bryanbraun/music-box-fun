# Bot

A twitter bot that watches the Twitter streaming API and retweets anything that contains a Music Box Fun song link.

## Running it locally

From the root project directory:

- `make dev-bot` - Rebuild and run the bot locally
- `make stop-bot` - Stop the bot from running locally

Currently I need to re-run this with each change, because I don't have a local volume set up. This is because I wanted to simplify by using the same Dockerfile for both development and production. I can change this in the future if I find that I need to do a lot of dev in the future.

## Deploy

See [the deploy docs](../docs/deploys.md).
