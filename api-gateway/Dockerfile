FROM node:18-alpine
WORKDIR /app
COPY . .
RUN cp .swcrc api-gateway/.swcrc && npm install
EXPOSE 8000
CMD ["npm", "--workspace=api-gateway", "run", "start"]
