FROM node:20-alpine AS base

WORKDIR /usr/src/app

# Copy package files for all services
COPY package.json ./
COPY lib/ ./lib/
COPY services/ ./services/

# Install dependencies
RUN npm install --workspaces

# API Service
FROM base AS api
WORKDIR /usr/src/app/services/api
CMD ["node", "src/index.js"]

# Live Service
FROM base AS live
WORKDIR /usr/src/app/services/live
CMD ["node", "src/index.js"]

# Analytics Service
FROM base AS analytics
WORKDIR /usr/src/app/services/analytics
CMD ["node", "src/index.js"]

# Importer Service
FROM base AS importer
WORKDIR /usr/src/app/services/importer
CMD ["node", "src/index.js"]
