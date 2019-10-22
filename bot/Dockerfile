FROM node:12.12.0

# Copy package.json so we can install app dependencies
# We do this before copying the rest of the app so we
# can rely on cached dependencies when there's no changes
# to package.json.
COPY package*.json ./

RUN npm install

# Bundle app source code inside the Docker image
COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]
