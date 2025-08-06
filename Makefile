dev: dev-api dev-site

stop: stop-api stop-site

dev-api:
	@docker-compose -f api/docker-compose.yml up -d

dev-site:
	@nohup caddy start --config site/Caddyfile &
	@echo "Server started at: https://localhost"

stop-api:
	@docker-compose -f api/docker-compose.yml stop

stop-site:
	@caddy stop;
	@echo "Server stopped (at https://localhost)"

test: dev-site
	@npm run test --prefix site


deploy-api: deploy-api-build deploy-api-deploy

deploy-site:
	@echo "todo: add a command for deploying the frontend site, if that would be useful"

deploy-all:
	@echo "todo: add a command for deploying the api and site, if that would be useful"

bundle-update:
	@echo "Updating Gemfile.lock with latest gem versions..."
	@touch api/Gemfile.lock
	@docker-compose -f api/docker-compose.yml run --rm api bundle update
	@echo "✅ Gemfile.lock updated! Ready to commit to git."
	@ls -la api/Gemfile.lock

deploy-api-build:
	@echo "### Building and pushing API image to GitHub Container Registry ###"
	@docker build -t ghcr.io/bryanbraun/music-box-fun:latest \
		--platform linux/amd64 \
		--build-arg BUNDLE_WITHOUT=development \
		--file api/Dockerfile \
		api/
	@docker push ghcr.io/bryanbraun/music-box-fun:latest
	@echo "✅ Image built and pushed to registry"

# I'm using "docker context use mbf-prod" on the docker-compose commands because doing so fixed some
# errors. I had been using "-c", but it seemed like some parts of the command weren't executing on
# the remote host. This fixed it (though it could probably be simplified).
deploy-api-deploy:
	@echo "### Pulling latest image on production ###"
	@docker context use mbf-prod && docker pull ghcr.io/bryanbraun/music-box-fun:latest && docker context use default
	@echo "### Stopping Production Containers ###"
	@docker context use mbf-prod && docker-compose -f api/docker-compose.prod.yml stop && docker context use default
	@echo "### Running Migrations ###"
	@docker context use mbf-prod && docker-compose -f api/docker-compose.prod.yml run --rm --service-ports api rails db:migrate && docker context use default
	@echo "### Starting Production Containers ###"
	@docker context use mbf-prod && docker-compose -f api/docker-compose.prod.yml up -d && docker context use default
	@echo "✅ Deployment complete"
