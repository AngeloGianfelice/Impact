# specify the node base image with your desired version node:<version>
FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# replace this with your application's default port
EXPOSE 8080

CMD ["npm","start"]