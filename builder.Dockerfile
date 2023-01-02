ARG BASE_IMAGE=node:16-alpine
FROM $BASE_IMAGE

COPY . .

RUN npx nx affected --all --target=build --parallel
