FROM registry.access.redhat.com/ubi9/nodejs-20:latest

WORKDIR /opt/app-root/src

COPY package*.json ./
RUN npm install --only=production

COPY . .

EXPOSE 8080
CMD ["npm", "start"]