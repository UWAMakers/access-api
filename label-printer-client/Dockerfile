FROM python:3-alpine

# Installs latest Chromium (92) package.
RUN apk add --no-cache nodejs yarn py3-wheel
RUN apk add --update --no-cache --virtual .tmp gcc libc-dev linux-headers
RUN apk add --no-cache jpeg-dev zlib-dev
RUN pip3 install --upgrade brother_ql
RUN apk del .tmp

WORKDIR /app
RUN cd /app

COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock

RUN yarn install --production

COPY *.js /app/

CMD ["node", "index.js"]