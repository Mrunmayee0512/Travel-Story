FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm rebuild bcrypt --build-from-source


EXPOSE 5000
CMD ["node", "index.js"]
