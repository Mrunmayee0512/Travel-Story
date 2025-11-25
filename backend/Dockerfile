FROM node:20

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Rebuild bcrypt for compatibility
RUN npm rebuild bcrypt --build-from-source

EXPOSE 5000
CMD ["node", "index.js"]
