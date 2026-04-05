FROM node:22-alpine AS builder
WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm install
RUN npx prisma generate

COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 3001
ENV NODE_ENV=production
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]

