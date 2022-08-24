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

# I'm using "docker context use prod" on the docker-compose commands because doing so fixed some
# errors. I had been using "-c", but it seemed like some parts of the command weren't executing on
# the remote host, resulting in containers not being transferred to prod and container IDs not being
# found on prod. This fixed it (though it could probably be simplified)
deploy-api:
	docker context use prod && docker-compose -f api/docker-compose.prod.yml build && docker context use default
	@echo "### Stopping Production Containers ###"
	@docker context use prod && docker-compose -f api/docker-compose.prod.yml stop && docker context use default
	@echo "### Running Migrations ###"
	@docker context use prod && docker-compose -f api/docker-compose.prod.yml run --rm --service-ports api rails db:migrate && docker context use default
	@echo "### Starting Production Containers ###"
	docker context use prod && docker-compose -f api/docker-compose.prod.yml up -d && docker context use default

deploy-bot:
	docker -c prod build bot/ -t musicboxbot
	docker -c prod stop bot || true && docker -c prod rm bot || true
	docker -c prod run -d --name bot --restart always musicboxbot:latest

deploy-site:
	@echo "todo: add a command for deploying the frontend site, if that would be useful"

deploy-all:
	@echo "todo: add a command for deploying the bot, api, and site all at once, if that would be useful"
