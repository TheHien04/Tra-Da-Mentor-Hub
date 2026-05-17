# Trà Đá Mentor — single container (API + React static)
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Same-origin production: API at /api, Socket at /
ARG VITE_API_URL=/api
ARG VITE_SOCKET_URL=
ARG VITE_ENVIRONMENT=production
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5000

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY backend ./backend
COPY --from=builder /app/dist ./dist

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:5000/api/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "backend/server.js"]
