FROM node:16

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm i --production

COPY . .
CMD ["node", "src/main.js"]