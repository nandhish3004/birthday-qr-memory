FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Ensure data and uploads folders exist
RUN mkdir -p data uploads public/assets/qr

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "src/server.js"]
