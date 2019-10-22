# Music Box Fun Bot

A twitter bot that watches the Twitter streaming API and retweets anything that contains a Music Box Fun song link.

## Running it locally

`npm run container`

## Deploying

It's a manual process for now.

1. From within this `bot` folder, send the files up to the server: `scp -r . root@162.243.246.86:./music-box-bot`
2. SSH up to the server: `ssh root@162.243.246.86`
3. Stop the existing music box bot container: `docker ps` *copy the container id* `docker stop <container id>`
4. Rebuild and start the new container: `docker build . -t music-box-bot && docker run -d music-box-bot`
