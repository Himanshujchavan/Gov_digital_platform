FROM node:20-alpine

WORKDIR /app

# Copy root package.json and workspace package.jsons
COPY package.json ./
COPY shared/package.json ./shared/
COPY auth-service/package.json ./auth-service/

# Install dependencies across workspaces
RUN npm install

# Copy source files
COPY shared/ ./shared/
COPY auth-service/ ./auth-service/

WORKDIR /app/auth-service

EXPOSE 8001

CMD ["npm", "start"]
