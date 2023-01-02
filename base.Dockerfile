FROM node:16-alpine

WORKDIR apps

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm ci --force
