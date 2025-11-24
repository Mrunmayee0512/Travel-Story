# Stage: build using Node (use Nexus-hosted Node image to avoid Docker Hub rate limits)
FROM nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/mpanderepo/node:20 AS build

WORKDIR /app

# copy only package files first for faster layer caching
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# copy rest and build
COPY . .
RUN npm run build

# Production image: nginx from Nexus
FROM nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/mpanderepo/nginx:alpine AS prod

# Remove default nginx content and copy build artefacts
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Keep nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
