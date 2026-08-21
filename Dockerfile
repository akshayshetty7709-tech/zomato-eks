# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /usr/src/app
COPY app/package*.json ./
RUN npm ci --omit=dev
COPY app/ .

# ---- Runtime stage ----
FROM node:20-alpine
WORKDIR /usr/src/app

# non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build /usr/src/app ./
ENV PORT=3005
EXPOSE 3005

USER appuser
CMD ["node", "server.js"]