FROM node:20-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

COPY package*.json ./
RUN npm install --frozen-lockfile

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]