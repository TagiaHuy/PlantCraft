FROM node:18

WORKDIR /app

COPY package*.json ./

COPY scripts ./scripts

RUN npm install

COPY . .


EXPOSE 3000

CMD ["node", "src/index.js"]