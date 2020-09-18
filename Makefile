dev: dev-api dev-site

stop: stop-api stop-site

dev-api:
	@docker-compose -f api/docker-compose.yml up -d

dev-site:
	@lsof -nti:1111 | xargs kill -9;
	@pushd site/public &> /dev/null; python -m SimpleHTTPServer 1111 &> /dev/null &
	@echo "Server at: http://0.0.0.0:1111"
	@pushd site/public &> /dev/null;

dev-bot:
	docker build bot/ -t music-box-bot
	docker stop bot || true && docker rm bot || true
	docker run -d --name bot music-box-bot:latest

stop-api:
	@docker-compose -f api/docker-compose.yml stop

stop-site:
	@lsof -nti:1111 | xargs kill -9
	@echo "Server stopped (at http://0.0.0.0:1111)"

stop-bot:
	docker stop bot || true && docker rm bot || true

test: dev-site
	@npm run test --prefix site

# I'm using "docker context use" on the migrate command because doing so fixed some errors.
# I had been using "-c", but it seemed like some parts of the command weren't executing on
# the remote host, resulting in some container IDs not being being found. This fixed it.
deploy-api:
	docker-compose -c prod -f api/docker-compose.prod.yml build
	echo "### Stopping Production Containers ###"
	@docker-compose -c prod -f api/docker-compose.prod.yml stop
	echo "### Running Migrations ###"
	@docker context use prod && docker-compose -f api/docker-compose.prod.yml run --rm --service-ports api rails db:migrate && docker context use default
	echo "### Starting Production Containers ###"
	docker-compose -c prod -f api/docker-compose.prod.yml up -d

deploy-bot:
	docker -c prod build bot/ -t musicboxbot
	docker -c prod stop bot || true && docker -c prod rm bot || true
	docker -c prod run -d --name bot --restart always musicboxbot:latest

deploy-site:
	@echo "todo: add a command for deploying the frontend site, if that would be useful"

deploy-all:
	@echo "todo: add a command for deploying the bot, api, and site all at once, if that would be useful"
