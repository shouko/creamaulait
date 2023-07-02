FROM node:18

RUN apt-get update && apt-get install -y \
    python3 python3-pip ffmpeg \
    && rm -rf /var/lib/apt/lists/*

ENV PIP_BREAK_SYSTEM_PACKAGES 1
RUN pip3 install --upgrade pip && \
    pip3 install yt-dlp streamlink

WORKDIR /app
COPY . /app/

RUN yarn --frozen-lockfile

USER node

ENTRYPOINT [ "yarn", "start" ]