#----------------------------------------------------------#
# First stage: base image for building server app #
#----------------------------------------------------------#
FROM node:16-alpine as base

WORKDIR /build

# Copy package*.json files first in order to make best use of docker layer caching
COPY package*.json ./ 
COPY server/package*.json ./server/

# npm clean slate install to get reproducible builds and quicker installs
RUN npm ci

# copy rest of the files
COPY *.js ./
COPY server/tsconfig* ./server/
COPY server/*.js ./server/
COPY server/src ./server/src/

#--------------------------------------------------------#
# Second stage: image to build and test node application #
#--------------------------------------------------------#
FROM base as build

# lint project
RUN npm run lint -w server

# build
RUN npm run build -w server

# run unit test
RUN npm run test -w server

#--------------------------------------------#
# Third stage: image to run node application #
#--------------------------------------------#
FROM node:16-alpine

WORKDIR /app

COPY --from=build /build/server/dist/ ./dist/
COPY --from=build /build/server/package*.json ./

RUN npm i --omit=dev

CMD [ "npm", "run", "start:prod" ]