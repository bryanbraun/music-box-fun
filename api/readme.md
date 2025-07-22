# API

The Music Box Fun backend API is built with Rails in API-only mode.

It's built on docker-compose, which runs Rails in one container and Postgres in another.

## Endpoints

<details>
 <summary><code>GET</code> <code><b>/</b></code> <code>(api status)</code></summary>

### Parameters

none

### Responses

| http code | content-type       | response               |
| --------- | ------------------ | ---------------------- |
| `200`     | `application/json` | `{ status: "online" }` |

### Example cURL

```bash
curl -X GET -H "Content-Type: application/json" http://localhost:3000
```

</details>

<details>
 <summary><code>GET</code> <code><b>/v1/songs</b></code> <code>(get songs)</code></summary>

### Parameters

| name     | type     | data type | description                                                                |
| -------- | -------- | --------- | -------------------------------------------------------------------------- |
| `offset` | optional | number    | The results offset by a specific number. Used for pagination. Default: 0   |
| `limit`  | optional | number    | An upper limit for how many results should be returned. Default: 150       |
| `q`      | optional | string    | A search query string. Can be used for both full results and autocomplete. |

### Responses

#### 200

```json
{
  "songs": [
    {
      "title": "Umi No Mieru Machi",
      "data": "0XQAAAAJ2BAAAAAAAAABBqEgrIsPV…",
      "creator": "@BryanEBraun",
      "creator_url": "https://twitter.com/BryanEBraun"
    },
    ⋮
  ],
  "meta": {
    "total": 200,
    "offset": 0,
    "limit": 150,
    "next": "/v1/songs?offset=150&limit=150"
  }
}
```


### Example cURL

Basic

```bash
curl -X GET -H "Content-Type: application/json" http://localhost:3000/v1/songs
```

With search query:
```bash
curl -X GET -H "Content-Type: application/json" http://localhost:3000/v1/songs?q=mario
```

With offset / limit:
```bash
curl -X GET -H "Content-Type: application/json" http://localhost:3000/v1/songs?offset=20&limit=10
```

</details>

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

See [our testing approach document](../site/cypress/README.md#first-time-setup-for-deploys).

