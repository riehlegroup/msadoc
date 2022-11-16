#----------------------------------------------------------#
# First stage: base image for building frontend app #
#----------------------------------------------------------#
FROM node:16-alpine as base

WORKDIR /build

# Copy package*.json files first in order to make best use of docker layer caching
COPY package*.json ./ 
COPY frontend/package*.json ./frontend/
COPY client-generated ./client-generated/

# copy rest of the files
COPY *.js ./
COPY frontend/tsconfig* ./frontend/
COPY frontend/*.js ./frontend/
COPY frontend/public ./frontend/public/
COPY frontend/.env* ./frontend/
COPY frontend/src ./frontend/src/

RUN npm ci

#--------------------------------------------------------#
# Second stage: image to build and test node application #
#--------------------------------------------------------#
FROM base as build

ARG REACT_APP_BACKEND_URL

# lint project
RUN npm run lint -w frontend

# build
RUN npm run build -w frontend

#--------------------------------------------#
# Third stage: image to run node application #
#--------------------------------------------#

FROM nginx:1-alpine

# copy static result of builder to the standard nginx webroot
COPY --from=build /build/frontend/build/ /usr/share/nginx/html

# use custom nginx config
COPY deployment/docker/frontend.Docker.nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
