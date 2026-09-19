FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

RUN npm prune --production

EXPOSE 4000
CMD ["npm", "start"]