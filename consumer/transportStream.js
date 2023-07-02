const fs = require('fs');

class TransportStreamConsumer {
  #outputPath;

  #writer;

  #maxSegmentSize = 0;

  #currentSegmentSize = 0;

  #sequence = 0;

  constructor(id, maxSegmentSize, upstreamEmitter) {
    this.#outputPath = `./data/${id}`;
    this.#maxSegmentSize = maxSegmentSize;
    upstreamEmitter.on('data', (data) => {
      this.#onData(data);
    });
    upstreamEmitter.on('end', () => {
      this.#onEnd();
    });
  }

  async ready() {
    return new Promise((resolve, reject) => {
      fs.stat(this.#outputPath, (err, stats) => {
        if (!err && stats.isDirectory()) {
          resolve();
          return;
        }
        if (err) {
          fs.mkdir(this.#outputPath, (mkdirerr) => {
            if (mkdirerr) {
              return reject(mkdirerr);
            }
            return resolve();
          });
        } else if (stats.isFile()) {
          reject();
        }
      });
    });
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
