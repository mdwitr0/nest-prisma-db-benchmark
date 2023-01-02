# pass builder and target base images from outside
# -------------------------------
ARG BUILDER_IMAGE=node:16-alpine
ARG BASE_IMAGE=node:16-alpine

# builder image
# -------------------------------
FROM $BUILDER_IMAGE AS builder

# target image
# -------------------------------
FROM $BASE_IMAGE

RUN apk add libssl1.1

ARG APP

COPY --from=builder /apps/dist/apps/$APP/ $APP
CMD node $APP/main.js
