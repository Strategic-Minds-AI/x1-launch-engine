# Source-reviewed build recipe, not an approved runtime deployment.
# Pin the base image by immutable digest before publishing or deploying.
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --chown=node:node package.json worker.mjs provision-preview.mjs ./
COPY --chown=node:node fixtures ./fixtures
USER node
CMD ["node", "worker.mjs"]
