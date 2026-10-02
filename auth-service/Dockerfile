FROM node:20-alpine

WORKDIR /app

COPY . .
RUN cp .swcrc auth-service/.swcrc && npm install

WORKDIR /app/auth-service

EXPOSE 8001

CMD ["npm", "start"]
