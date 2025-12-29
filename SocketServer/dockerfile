FROM node:22-alpine

RUN mkdir -p /socketServer/app
WORKDIR /socketServer/app

# Copy package files first for better layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies for TypeScript build)
RUN npm ci

# Copy source files and configuration
COPY tsconfig.json ./
COPY src/ ./src/

# Build TypeScript to JavaScript
RUN npm run build

# Remove devDependencies to reduce image size
RUN npm prune --production

ENV PORT=3000
EXPOSE 3000

CMD [ "npm", "start" ]

