FROM alpine

# Installs latest Chromium (92) package.
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn \
      imagemagick

RUN apk add netpbm --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing/

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Add user so we don't need --no-sandbox.
RUN addgroup -S node && adduser -S -g node node \
    && mkdir -p /home/node/Downloads /app \
    && chown -R node:node /home/node \
    && chown -R node:node /app

# Run everything after as non-privileged user.
USER node
WORKDIR /app
RUN cd /app

COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock

RUN yarn install --production

COPY *.js /app/
COPY templates/* /app/templates/
COPY *.png /app/

EXPOSE 3000

CMD ["node", "server.js"]