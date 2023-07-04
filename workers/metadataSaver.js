const fs = require('fs-extra');
const path = require('path');
const { storagePath } = require('../config');

class MetadataSaver {
  #id;

  constructor(id, upstreamEmitter) {
    this.#id = id;
    upstreamEmitter.on('metadata', async (metadata) => {
      await fs.ensureDir(this.#outputPath);
      fs.writeFile(
        path.join(this.#outputPath, 'metadata.json'),
        JSON.stringify(metadata, null, 2),
        (err) => {
          if (err) {
            console.error(`Failed to write metadata for ${id}`);
            return;
          }
          console.log(`Wrote metadata for ${id}`);
        },
      );
    });
  }

  get #outputPath() {
    return path.join(storagePath, this.#id);
  }

  start() {
    console.log(`MetadataSaver for ${this.#id} started`);
  }
}

module.exports = {
  MetadataSaver,
};
