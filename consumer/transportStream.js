const fs = require('fs');
const { EventEmitter } = require('events');

class TransportStreamConsumer {
  #emitter = new EventEmitter();

  #outputPath;

  #writer;

  #maxSegmentSize = 0;

  #currentSegmentSize = 0;

  #sequence = 0;

  constructor(id, maxSegmentSize) {
    this.#outputPath = `./data/${id}`;
    this.#maxSegmentSize = maxSegmentSize;
    this.#emitter.on('data', (data) => {
      this.#onData(data);
    });
    this.#emitter.on('end', () => {
      this.#onEnd();
    });
  }

  get emitter() {
    return this.#emitter;
  }

  async #getWriter() {
    let tickSequence = false;
    if (this.#maxSegmentSize > 0 && this.#currentSegmentSize > this.#maxSegmentSize) {
      this.#sequence += 1;
      tickSequence = true;
    }
    if (this.#writer && tickSequence) {
      this.#writer.close((err) => {
        if (!err) return;
        console.error('Failed to close', err);
      });
      this.#writer = null;
    }
    if (!this.#writer) {
      this.#writer = fs.createWriteStream(`${this.#outputPath}/segment_${this.#sequence}.ts`, { flags: 'w' });
      this.#currentSegmentSize = 0;
    }
    return this.#writer;
  }

  async #onData(chunk) {
    const writer = await this.#getWriter();
    this.#currentSegmentSize += chunk.length;
    writer.write(chunk);
  }

  async #onEnd() {
    this.#writer.close((err) => {
      if (!err) return;
      console.error('Failed to close', err);
    });
  }
}

module.exports = {
  TransportStreamConsumer,
};
