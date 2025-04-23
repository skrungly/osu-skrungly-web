FROM node:lts-alpine

# temporary, for early-stage testing
RUN npm install -g http-server

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

CMD ["http-server", "dist", "-p", "80"]
