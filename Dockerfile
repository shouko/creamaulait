FROM node:18-bullseye

RUN apt-get update && apt-get install -y \
    python3 python3-pip ffmpeg \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install --upgrade pip && \
    pip3 install streamlink

WORKDIR /app
COPY . /app/

RUN yarn --frozen-lockfile

USER node

ENTRYPOINT [ "yarn", "start" ]