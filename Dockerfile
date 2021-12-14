FROM nginx
RUN yes | apt-get update && \ apt-get install -y libgtk2.0-0 libgtk-3-0 libnotify-dev \ libgconf-2-4 libnss3 libxss1 \ libasound2 libxtst6 xauth xvfb \ libgbm-dev
FROM node:14
WORKDIR /app
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install
COPY . .
CMD [ "node", "./bin/www" ]
