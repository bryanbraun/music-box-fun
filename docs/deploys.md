# Deployment instructions

Deploys are optimized for simplicity, with the assumption that I'll always be deploying to a single server from my personal machine.

We use docker-context to simplify this process, as described in [rhis blog post](https://www.docker.com/blog/how-to-deploy-on-remote-docker-hosts-with-docker-compose/).

## First time setup for deploys

Create a production docker context called `prod`, that references the prod server IP address.

```bash
# Note: deploys will only work if your SSH key is registered with the web host.
docker context create prod --docker "host=ssh://root@198.199.79.182"
```

Now, we can use the `-c prod` argument to execute any docker or docker-compose commands remotely on the prod server. For example:
- `docker -c prod ps` - See what containers are running
- `docker -c prod logs api` - Inspect the logs of the api container
- `docker -c prod stop api` - Stops the `api` container

## Deploy Commands

Deploy commands can be found in the Makefile, and are executed from the project root. Examples include:

- `make deploy-api` - Builds an image based on the state of my local `api` codebase and deploys it to prod.
- `make deploy-bot` - Builds an image based on the state of my local `bot` codebase and deploys it to prod.

The frontend code is currently automatically deployed when the repo is pushed to Github.

## Database Backups

My Digital Ocean Droplet does weekly instance backups, which includes the database. I'm ok with losing up to a week of data, as a worst-case-scenario. To restore from a backup:

1. Log into Digital Ocean > Music Box Fun > My Droplet > Backups > [Restore From Backup]
2. Redeploy each of the services (which should also rerun any migrations).
