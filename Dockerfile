FROM nginx
RUN apt-get install libnss3-dev
FROM node:14
WORKDIR /app
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install
COPY . .
CMD [ "node", "./bin/www" ]
