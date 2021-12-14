FROM ubuntu
RUN apt-get update
RUN apt-get install -y libnss3-dev
FROM node:14
WORKDIR /app
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install
COPY . .
CMD [ "node", "./bin/www" ]
