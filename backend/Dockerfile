FROM nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/mpanderepo/node:20

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 5000
CMD ["npm", "start"]
