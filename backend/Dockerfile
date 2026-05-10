FROM node:20-alpine AS worker
WORKDIR /app

# Worker only needs pg driver
COPY package.json package-lock.json* ./
RUN npm install --omit=dev pg 2>/dev/null || npm install pg

COPY worker.js ./
COPY sql/ ./sql/

ENV NODE_ENV=production
CMD ["node", "worker.js", "award-badges"]
