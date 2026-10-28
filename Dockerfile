FROM node:24-alpine

WORKDIR /app
ENV TRANSMISSION_HOST=192.168.1.111
ENV TRANSMISSION_PORT=9091
ENV TRANSMISSION_USERNAME=admin
ENV TRANSMISSION_PASSWORD=admin
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
