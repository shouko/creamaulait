const { spawn } = require('child_process');

class TransportStreamProducer {
  #process;

  #consumers;

  #startedAt;

  #accumulatedBytes = 0;

  #windowTimestamp = 0;

  #bytesInWindow = 0;

  #window = [];

  constructor(sourceUrl, consumers) {
    const now = new Date();
    this.#consumers = consumers;
    this.#startedAt = now;
    this.#window.push({
      ts: now,
      bytes: 0,
    });
    this.#windowTimestamp = now;
    this.#process = spawn('streamlink', ['--stdout', sourceUrl, 'best']);
    this.#process.stdout.on('data', (data) => {
      this.#onPayload(data);
    });
    this.#process.stderr.on('data', (data) => {
      this.#onMessage(data);
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

    this.#consumers.forEach((consumer) => consumer.emitter.emit('data', chunk));
  }

  #onMessage(chunk) {
    console.log(`Message ${chunk.toString()}`);
    this.#consumers.forEach((consumer) => consumer.emitter.emit('data', chunk));
  }
}

module.exports = {
  TransportStreamProducer,
};
