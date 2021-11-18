dev: dev-api dev-site

stop: stop-api stop-site

dev-api:
	@docker-compose -f api/docker-compose.yml up -d

dev-site:
	@nohup caddy start --config site/Caddyfile &
	@echo "Server started at: https://localhost"

dev-bot:
	docker build bot/ -t music-box-bot
	docker stop bot || true && docker rm bot || true
	docker run -d --name bot music-box-bot:latest

stop-api:
	@docker-compose -f api/docker-compose.yml stop

stop-site:
	@caddy stop;
	@echo "Server stopped (at https://localhost)"

stop-bot:
	docker stop bot || true && docker rm bot || true

test: dev-site
	@npm run test --prefix site

# I'm using "docker context use" on the migrate command because doing so fixed some errors.
# I had been using "-c", but it seemed like some parts of the command weren't executing on
# the remote host, resulting in some container IDs not being being found. This fixed it.
#
# Note: last time, I noticed that this "deploy" would build, stop, migrate, and restart the
# remote containers, but it didn't actually transfer my local image to the remote server.
# So last time, I did that manually (following these steps: https://stackoverflow.com/a/23938978/1154642),
# and then ran deploy-api (which worked). I should probably automate this in the near future.
deploy-api:
	docker-compose -c prod -f api/docker-compose.prod.yml build
	@echo "### Stopping Production Containers ###"
	@docker-compose -c prod -f api/docker-compose.prod.yml stop
	@echo "### Running Migrations ###"
	@docker context use prod && docker-compose -f api/docker-compose.prod.yml run --rm --service-ports api rails db:migrate && docker context use default
	@echo "### Starting Production Containers ###"
	docker-compose -c prod -f api/docker-compose.prod.yml up -d

deploy-bot:
	docker -c prod build bot/ -t musicboxbot
	docker -c prod stop bot || true && docker -c prod rm bot || true
	docker -c prod run -d --name bot --restart always musicboxbot:latest

deploy-site:
	@echo "todo: add a command for deploying the frontend site, if that would be useful"

deploy-all:
	@echo "todo: add a command for deploying the bot, api, and site all at once, if that would be useful"
