FROM node:18-slim

RUN apt-get update && apt-get install -y \
    wget ca-certificates chromium \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD [ "node", "index.js" ]