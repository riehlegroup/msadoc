FROM timbru31/java-node:jdk-14

ENV OPENAPI_URL=
ENV GENERATOR=
ENV ADDITIONAL_PROPERTIES=

RUN npm install @openapitools/openapi-generator-cli -g

RUN mkdir /local
WORKDIR /local

ENTRYPOINT [ \
    "/bin/bash", \ 
    "-c", \
    "openapi-generator-cli generate -i=${OPENAPI_URL} --generator-name=${GENERATOR} -o /local/out --additional-properties=${ADDITIONAL_PROPERTIES}" \
]