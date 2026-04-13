FROM node:20-alpine

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "backend/server.js"]
