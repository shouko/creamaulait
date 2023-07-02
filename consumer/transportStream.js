const fs = require('fs');
const path = require('path');
const { storagePath } = require('../config');

class TransportStreamConsumer {
  #outputPath;

  #writer;

  #maxSegmentSize = 0;

  #currentSegmentSize = 0;

  #sequence = 0;

  constructor(id, maxSegmentSize, upstreamEmitter) {
    this.#outputPath = path.join(storagePath, id);
    this.#maxSegmentSize = maxSegmentSize || 0;
    upstreamEmitter.on('data', (data) => {
      this.#onData(data);
    });
    upstreamEmitter.on('end', (code) => {
      console.log(`Received end event from upstream, code ${code}`);
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
      const filepath = path.join(
        this.#outputPath,
        this.#maxSegmentSize === 0 ? 'output.ts' : `segment_${this.#sequence}.ts`,
      );
      this.#writer = fs.createWriteStream(filepath, { flags: 'w' });
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
    console.log(`Closing ${this.#writer.path}`);
    this.#writer.close((err) => {
      if (!err) {
        console.log(`Closed ${this.#writer.path}`);
        return;
      }
      console.error(`Failed to close ${this.#writer.path}`, err);
    });
  }
}

module.exports = {
  TransportStreamConsumer,
};
