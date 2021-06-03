FROM node:12.12.0

# Create a folder for our bot inside the container
RUN mkdir -p /root/bot

# Set our working directory inside the container
WORKDIR /root/bot

# Copy package.json so we can install app dependencies
# We do this before copying the rest of the app so we
# can rely on cached dependencies when there's no changes
# to package.json.
COPY package*.json ./

RUN npm ci

# Bundle app source code inside the Docker image
COPY . .

# @todo: I think this isn't necessary, because EXPOSE is
# for communication between containers and we don't need
# that here.
EXPOSE 8080

CMD [ "npm", "start" ]
