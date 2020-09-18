# API

The Music Box Fun backend API is built with Rails in API-only mode.

It's built on docker-compose, which runs Rails in one container and Postgres in another.

## Local setup

1. Pull this repo down to your computer.
2. Duplicate `.env.example` twice, rename them to `.env.dev` and `.env.prod`, and populate the local environment variables with their correct values.
3. Install docker (and docker-compose).
4. Run the api containers: `docker-compose up -d`
5. Create your local database
    - Open a shell in the running Rails application container: `docker exec -it api /bin/bash`
    - Run `rails db:setup`
    - (alternatively you could import an existing copy of the database)


## Starting the app

1. Run `make dev-api` from the project root.
2. Test that the API is working: `curl http://localhost:3000`

## Common tasks

**Rails CLI**

The `rails` cli contains many common tasks. It's best to use it inside the running rails container:

```bash
# Open a session in the api container using Bryan's .bash_profile shortcut
# (alternatively: docker exec -it api /bin/bash)
dsh api

# Print all the available commands for the rails cli
rails
```

Some common commands:

- Run migrations: `rails db:migrate`
- Generate new files: `rails generate migration add_songs_table`
- Explore your data: `rails console`

**Debugging**

1. Attach a terminal session to the rails container running your application:

```
docker attach api
```

2. Insert `byebug` into the code where you want to pause execution.
3. Load the page, then check your terminal session where you'll see the debugger waiting for you.
4. To detach: hold `ctrl`, type `p`, then type `q`

You can also view logs in the running container with `docker logs api`.


## Host Server setup

* Ensure the server has docker and docker-compose installed
* [Set up your local environment for deploys](../docs/deploys.md#).

## Tests

See [our testing approach document](../site/cypress/readme.md#first-time-setup-for-deploys).

