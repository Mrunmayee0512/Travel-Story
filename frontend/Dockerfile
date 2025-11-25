FROM nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/mpanderepo/node:20 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/mpanderepo/nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
