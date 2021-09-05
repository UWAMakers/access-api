FROM node:14
WORKDIR /usr/src/app

ENV VUE_APP_API_URL=/

RUN git clone https://github.com/UWAMakers/access-frontend.git
RUN cd access-frontend && yarn && yarn build
RUN cd ../
RUN git clone https://github.com/UWAMakers/access-api.git
RUN cp -r ./access-api/* .
RUN yarn
RUN cp -r access-frontend/dist/* ./public
EXPOSE 3030
CMD ["yarn", "start"]

