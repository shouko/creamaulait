const { mkdtemp } = require('fs/promises');
const path = require('path');
const { tmpdir } = require('os');
const { spawn } = require('child_process');
const { EventEmitter } = require('events');
const { probeStream } = require('./utils');

class TransportStreamProducer {
  #process;

  #emitter;

  #sourceUrl;

  #startedAt;

  #accumulatedBytes = 0;

  #windowTimestamp = 0;

  #bytesInWindow = 0;

  #window = [];

  constructor(sourceUrl) {
    this.#emitter = new EventEmitter();
    this.#sourceUrl = sourceUrl;
  }

  get emitter() {
    return this.#emitter;
  }

  async start() {
    if (this.#startedAt) {
      throw Error('Already started');
    }
    const { data: streamMeta } = await probeStream(this.#sourceUrl);
    this.#emitter.emit('metadata', streamMeta);

    const now = new Date();
    this.#startedAt = now;
    this.#window.push({
      ts: now,
      bytes: 0,
    });
    this.#windowTimestamp = now;
    if (streamMeta.is_live) {
      this.#process = spawn('streamlink', [
        '--loglevel', 'debug',
        '--ffmpeg-verbose',
        '--ffmpeg-fout', 'mpegts',
        '--stdout',
        '--retry-open', '3',
        this.#sourceUrl,
        'best',
      ]);
    } else {
      const tempdir = await mkdtemp(path.join(tmpdir(), 'yt-dlp-'));
      this.#process = spawn('yt-dlp', ['-o', '-', this.#sourceUrl], {
        cwd: tempdir,
      });
    }
    this.#process.stdout.on('data', (data) => {
      this.#onPayload(data);
    });
    this.#process.stderr.on('data', (data) => {
      this.#onMessage(data);
    });
    this.#process.on('exit', (code) => {
      this.#emitter.emit('end', code);
    });
  }

  #onPayload(chunk) {
    const now = new Date();
    this.#accumulatedBytes += chunk.length;
    this.#window.push({
      ts: now,
      bytes: chunk.length,
    });
    this.#bytesInWindow += chunk.length;

    const rate = (this.#bytesInWindow / (now - this.#windowTimestamp)) * (1000 / 1024);
    const avgRate = (this.#accumulatedBytes / (now - this.#startedAt)) * (1000 / 1024);
    console.log(`Received ${chunk.length} bytes, rate ${Math.round(rate)}kB/s (avg. ${Math.round(avgRate)}kB/s)`);

    if (this.#window.length >= 10) {
      const { ts, bytes } = this.#window.shift();
      this.#bytesInWindow -= bytes;
      this.#windowTimestamp = ts;
    }

    this.#emitter.emit('data', chunk);
  }

  #onMessage(chunk) {
    console.log(`Message ${chunk.toString()}`);
    this.#emitter.emit('message', chunk);
  }
}

module.exports = {
  TransportStreamProducer,
};
