# Development stage
FROM node:24-alpine AS development

WORKDIR /app

# Install bash for better shell compatibility
RUN apk add --no-cache bash

COPY package*.json ./

# Install with safer options and increased heap size for limited memory
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm install --no-optional --legacy-peer-deps && npm cache clean --force

EXPOSE 3001

CMD ["npm", "run", "start:dev"]

# Build stage (for production)
FROM node:24-alpine AS base

WORKDIR /app

COPY package*.json ./

ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm install --only=production --legacy-peer-deps && npm cache clean --force

COPY . .

RUN npm run build

FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package*.json ./
COPY --from=base /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main"]
