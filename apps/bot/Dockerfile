FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages/shared ./packages/shared
COPY apps/bot ./apps/bot
RUN npm ci --workspace=@skin-mne/shared --workspace=@skin-mne/bot
RUN npm run build -w @skin-mne/shared && npm run build -w @skin-mne/bot

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/bot/dist ./dist
COPY --from=builder /app/apps/bot/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./node_modules/@skin-mne/shared/dist
CMD ["node", "dist/index.js"]
