# API

The Music Box Fun backend API is built with Rails in API-only mode.

It's built on docker-compose, which runs rails in one container and postgres in another.

## One-time installation

To run this application locally.

1. Pull this repo down to your computer.
2. Duplicate `.env.example`, rename it to `.env`, and populate the local environment variables with their correct values.
3. Install docker (and docker-compose).
4. From the project root, run `docker-compose up -d`
5. Create your local database
    - Open a shell in the running Rails application container: `docker exec -it api /bin/bash`
    - Run `rails db:setup`
    - (alternatively you could import an existing copy of the database)


## Starting the app

```bash
## starting the containers
docker-compose up -d

## test that the API is working:
curl http://localhost:3000

## when done: stop the containers
docker-compose down
```

## Common tasks

**Rails CLI**

The `rails` cli contains many common tasks. It's best to use it inside the running rails container:

```bash
# Open a session in the api container using Bryan's .bash_profile shortcut
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

You can also view logs in the running container with `docker logs api`.


## Host Server setup

* Ensure it has docker and docker-compose installed
* Create a `.env` file defining things like SECRET_KEY_BASE, POSTGRES_PASSWORD, and RAILS_ENV.

## Tests

See [our testing approach document](../site/cypress/readme.md).


## Deployment instructions
TBD

## Database Backups
TBD
