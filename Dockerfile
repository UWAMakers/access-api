FROM node:18-alpine
WORKDIR /usr/src/app

ENV VUE_APP_API_URL=/

# Install git because yarn may need it to resolve dependencies linked to git URLs
RUN apk add --no-cache git

# Install dependencies separately to leverage Docker's layer caching
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile && \
    yarn cache clean

# Copy the local API source code
COPY . .

# Build step if necessary (e.g., if you have a build script in package.json)
# RUN yarn build

EXPOSE 3030
CMD ["yarn", "start"]

