FROM ubuntu:18
RUN apt-get update
RUN apt-get install -y chromium-browser
RUN apt-get install -y libgtk2.0-0 libgtk-3-0 libnotify-dev
RUN apt-get install -y libgconf-2-4 libnss3 libxss1
RUN apt-get install -y libasound2 libxtst6 xauth xvfb
RUN apt-get install -y libgbm-dev
RUN apt-get install -y ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm-dev libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils
FROM node:14.18.2
WORKDIR /app
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install
COPY . .
CMD [ "node", "./bin/www" ]
