FROM node:18-slim

# Install necessary packages for Puppeteer
RUN apt-get update && apt-get install -y \
    wget ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 \
    libatk1.0-0 libcups2 libdbus-1-3 libgdk-pixbuf2.0-0 libnspr4 libnss3 \
    libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 xdg-utils libgbm-dev \
    libgtk-3-0 libxshmfence1 --no-install-recommends \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Expose port and run app
EXPOSE 3000
CMD [ "node", "index.js" ]
