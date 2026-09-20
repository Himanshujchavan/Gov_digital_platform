FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY shared/package.json ./shared/
COPY simulated-departments/package.json ./simulated-departments/

RUN npm install

COPY shared/ ./shared/
COPY simulated-departments/ ./simulated-departments/

WORKDIR /app/simulated-departments

EXPOSE 8002

CMD ["npm", "start"]