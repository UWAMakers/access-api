FROM python:3-alpine

RUN apk add --no-cache py3-wheel
RUN apk add --update --no-cache --virtual .tmp gcc libc-dev linux-headers
RUN apk add --no-cache jpeg-dev zlib-dev
RUN apk -UvX http://dl-cdn.alpinelinux.org/alpine/edge/main add -u nodejs
RUN apk add --no-cache yarn --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community/
RUN pip3 install --upgrade brother_ql-inventree
RUN apk del .tmp

WORKDIR /app
RUN cd /app

COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock

RUN yarn install --production

COPY *.js /app/

CMD ["node", "index.js"]