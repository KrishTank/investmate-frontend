# --------------------------------------------------------------------------
# INVESTMATE Frontend — multi-stage production Dockerfile
# Stage 1: build the static Vite/React bundle with Node
# Stage 2: serve the built static files with Nginx (small, fast, no Node
#          runtime needed at serve-time)
# --------------------------------------------------------------------------

# ---- Stage 1: Build ----
FROM node:20-slim AS build

WORKDIR /app

# Copy only package manifests first so npm install is cached unless
# dependencies actually change.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source.
COPY . .

# VITE_API_URL is a BUILD-TIME variable — Vite inlines import.meta.env.*
# values directly into the compiled JS bundle, so it must be available
# during `npm run build`, not at container runtime. Pass it in via
# `docker build --build-arg VITE_API_URL=...` or docker-compose's
# `build.args` (see docker-compose.yml). If not provided, it defaults to
# empty and api.js's own fallback (http://localhost:8000) takes over.
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ---- Stage 2: Serve ----
FROM nginx:1.27-alpine AS serve

# Remove the default Nginx welcome page config.
RUN rm -f /etc/nginx/conf.d/default.conf

# Custom Nginx config: serve the SPA and fall back to index.html for any
# unmatched route (client-side routing safe), with basic gzip enabled.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static assets from the build stage.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
